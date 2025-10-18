from fastapi import FastAPI, APIRouter, HTTPException, Depends, Request
from fastapi.responses import RedirectResponse
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional
import uuid
from datetime import datetime, timezone, timedelta
import jwt
import httpx


ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# JWT Configuration
JWT_SECRET = os.environ.get('JWT_SECRET', 'your-secret-key-change-in-production')
JWT_ALGORITHM = "HS256"
JWT_EXPIRATION_HOURS = 72

# Discord OAuth Configuration
DISCORD_CLIENT_ID = os.environ.get('DISCORD_CLIENT_ID')
DISCORD_CLIENT_SECRET = os.environ.get('DISCORD_CLIENT_SECRET')
DISCORD_REDIRECT_URI = os.environ.get('DISCORD_REDIRECT_URI')

# Google OAuth Configuration
GOOGLE_CLIENT_ID = os.environ.get('GOOGLE_CLIENT_ID')
GOOGLE_CLIENT_SECRET = os.environ.get('GOOGLE_CLIENT_SECRET')
GOOGLE_REDIRECT_URI = os.environ.get('GOOGLE_REDIRECT_URI')

# Admin lists
ADMIN_EMAILS = [
    'mangobae.x@gmail.com',
    'tonhqq@gmail.com',
    'ckristopher97@gmail.com',
    'fercherry3@gmail.com',
    'jcmaurenzi@gmail.com',
    'juretaparraguez@gmail.com',
    'polettimateo@gmail.com',
    'sasazcoitia@gmail.com'
]

ADMIN_DISCORD_USERNAMES = [
    'copium_',
    'azphros',
    'fergoomy',
    'gonchi',
    'furyyyyyyyy',
    'pastabase'
]

# Create the main app without a prefix
app = FastAPI()

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")


# Define Models
class User(BaseModel):
    model_config = ConfigDict(extra="ignore")
    
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    email: Optional[str] = None
    discord_id: Optional[str] = None
    discord_username: Optional[str] = None
    google_id: Optional[str] = None
    name: str
    avatar: Optional[str] = None
    role: str = "member"  # "admin" or "member"
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


class Player(BaseModel):
    model_config = ConfigDict(extra="ignore")
    
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: Optional[str] = None  # Reference to User
    nombre: str
    clase_pvp: str
    spec: str
    ap: int
    aap: int
    dp: int
    gs: float
    builds: str
    linkeo: str
    print_gear_pvp: str
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


class PlayerCreate(BaseModel):
    nombre: str
    clase_pvp: str
    spec: str
    ap: int
    aap: int
    dp: int
    gs: float
    builds: str
    linkeo: str
    print_gear_pvp: str


class PlayerUpdate(BaseModel):
    nombre: Optional[str] = None
    clase_pvp: Optional[str] = None
    spec: Optional[str] = None
    ap: Optional[int] = None
    aap: Optional[int] = None
    dp: Optional[int] = None
    gs: Optional[float] = None
    builds: Optional[str] = None
    linkeo: Optional[str] = None
    print_gear_pvp: Optional[str] = None


# JWT Helper Functions
def create_jwt_token(user_data: dict) -> str:
    """Create JWT token for user"""
    expiration = datetime.now(timezone.utc) + timedelta(hours=JWT_EXPIRATION_HOURS)
    payload = {
        "user_id": user_data["id"],
        "email": user_data.get("email"),
        "discord_username": user_data.get("discord_username"),
        "role": user_data["role"],
        "exp": expiration
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)


def verify_jwt_token(token: str) -> dict:
    """Verify and decode JWT token"""
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        return payload
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")


async def get_current_user(request: Request) -> dict:
    """Dependency to get current user from JWT token"""
    auth_header = request.headers.get("Authorization")
    if not auth_header or not auth_header.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Missing authentication token")
    
    token = auth_header.split(" ")[1]
    payload = verify_jwt_token(token)
    
    user = await db.users.find_one({"id": payload["user_id"]}, {"_id": 0})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    return user


async def require_admin(current_user: dict = Depends(get_current_user)) -> dict:
    """Dependency to require admin role"""
    if current_user["role"] != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    return current_user


# Auth Routes
@api_router.get("/auth/discord")
async def discord_login():
    """Redirect to Discord OAuth"""
    discord_auth_url = (
        f"https://discord.com/api/oauth2/authorize?"
        f"client_id={DISCORD_CLIENT_ID}&"
        f"redirect_uri={DISCORD_REDIRECT_URI}&"
        f"response_type=code&"
        f"scope=identify%20email"
    )
    return RedirectResponse(url=discord_auth_url)


@api_router.get("/auth/discord/callback")
async def discord_callback(code: str):
    """Handle Discord OAuth callback"""
    async with httpx.AsyncClient() as client:
        # Exchange code for access token
        token_response = await client.post(
            "https://discord.com/api/oauth2/token",
            data={
                "client_id": DISCORD_CLIENT_ID,
                "client_secret": DISCORD_CLIENT_SECRET,
                "grant_type": "authorization_code",
                "code": code,
                "redirect_uri": DISCORD_REDIRECT_URI
            },
            headers={"Content-Type": "application/x-www-form-urlencoded"}
        )
        
        if token_response.status_code != 200:
            raise HTTPException(status_code=400, detail="Failed to get Discord token")
        
        token_data = token_response.json()
        access_token = token_data["access_token"]
        
        # Get user info from Discord
        user_response = await client.get(
            "https://discord.com/api/users/@me",
            headers={"Authorization": f"Bearer {access_token}"}
        )
        
        if user_response.status_code != 200:
            raise HTTPException(status_code=400, detail="Failed to get Discord user info")
        
        discord_user = user_response.json()
        
        discord_id = discord_user["id"]
        discord_username = discord_user["username"]
        email = discord_user.get("email")
        avatar = f"https://cdn.discordapp.com/avatars/{discord_id}/{discord_user['avatar']}.png" if discord_user.get('avatar') else None
        
        # Check if user exists
        existing_user = await db.users.find_one({"discord_id": discord_id}, {"_id": 0})
        
        # Determine role
        is_admin = email in ADMIN_EMAILS or discord_username in ADMIN_DISCORD_USERNAMES
        role = "admin" if is_admin else "member"
        
        # Check if player exists in players collection
        player = await db.players.find_one({"nombre": discord_username}, {"_id": 0})
        
        if not existing_user and not player:
            raise HTTPException(
                status_code=403, 
                detail="Tu cuenta de Discord no está registrada en el gremio. Contacta a un administrador."
            )
        
        if existing_user:
            # Update existing user
            await db.users.update_one(
                {"discord_id": discord_id},
                {"$set": {
                    "discord_username": discord_username,
                    "email": email,
                    "avatar": avatar,
                    "role": role
                }}
            )
            user_data = existing_user
            user_data["role"] = role
        else:
            # Create new user and link to player
            user_data = {
                "id": str(uuid.uuid4()),
                "discord_id": discord_id,
                "discord_username": discord_username,
                "email": email,
                "name": discord_username,
                "avatar": avatar,
                "role": role,
                "created_at": datetime.now(timezone.utc).isoformat()
            }
            await db.users.insert_one(user_data)
            
            # Link player to user
            if player:
                await db.players.update_one(
                    {"nombre": discord_username},
                    {"$set": {"user_id": user_data["id"]}}
                )
        
        # Create JWT token
        token = create_jwt_token(user_data)
        
        # Redirect to frontend with token
        frontend_url = os.environ.get('FRONTEND_URL', 'https://bdoplayers.preview.emergentagent.com')
        return RedirectResponse(url=f"{frontend_url}?token={token}")


@api_router.get("/auth/google")
async def google_login():
    """Redirect to Google OAuth"""
    google_auth_url = (
        f"https://accounts.google.com/o/oauth2/v2/auth?"
        f"client_id={GOOGLE_CLIENT_ID}&"
        f"redirect_uri={GOOGLE_REDIRECT_URI}&"
        f"response_type=code&"
        f"scope=openid%20email%20profile"
    )
    return {"url": google_auth_url}


@api_router.get("/auth/google/callback")
async def google_callback(code: str):
    """Handle Google OAuth callback"""
    async with httpx.AsyncClient() as client:
        # Exchange code for access token
        token_response = await client.post(
            "https://oauth2.googleapis.com/token",
            data={
                "client_id": GOOGLE_CLIENT_ID,
                "client_secret": GOOGLE_CLIENT_SECRET,
                "code": code,
                "grant_type": "authorization_code",
                "redirect_uri": GOOGLE_REDIRECT_URI
            }
        )
        
        if token_response.status_code != 200:
            raise HTTPException(status_code=400, detail="Failed to get Google token")
        
        token_data = token_response.json()
        access_token = token_data["access_token"]
        
        # Get user info from Google
        user_response = await client.get(
            "https://www.googleapis.com/oauth2/v2/userinfo",
            headers={"Authorization": f"Bearer {access_token}"}
        )
        
        if user_response.status_code != 200:
            raise HTTPException(status_code=400, detail="Failed to get Google user info")
        
        google_user = user_response.json()
        
        google_id = google_user["id"]
        email = google_user["email"]
        name = google_user.get("name", email)
        avatar = google_user.get("picture")
        
        # Determine role - only email for Google
        is_admin = email in ADMIN_EMAILS
        role = "admin" if is_admin else "member"
        
        # Check if user exists
        existing_user = await db.users.find_one({"google_id": google_id}, {"_id": 0})
        
        if existing_user:
            # Update existing user
            await db.users.update_one(
                {"google_id": google_id},
                {"$set": {
                    "email": email,
                    "name": name,
                    "avatar": avatar,
                    "role": role
                }}
            )
            user_data = existing_user
            user_data["role"] = role
        else:
            # Create new user
            user_data = {
                "id": str(uuid.uuid4()),
                "google_id": google_id,
                "email": email,
                "name": name,
                "avatar": avatar,
                "role": role,
                "created_at": datetime.now(timezone.utc).isoformat()
            }
            await db.users.insert_one(user_data)
        
        # Create JWT token
        token = create_jwt_token(user_data)
        
        # Redirect to frontend with token
        frontend_url = os.environ.get('FRONTEND_URL', 'https://bdoplayers.preview.emergentagent.com')
        return RedirectResponse(url=f"{frontend_url}?token={token}")


@api_router.get("/auth/me")
async def get_me(current_user: dict = Depends(get_current_user)):
    """Get current user info"""
    return current_user


# Player Routes (Admin)
@api_router.get("/admin/players", response_model=List[Player])
async def get_all_players(admin: dict = Depends(require_admin)):
    """Get all players (admin only)"""
    players = await db.players.find({}, {"_id": 0}).to_list(1000)
    for player in players:
        if isinstance(player.get('created_at'), str):
            player['created_at'] = datetime.fromisoformat(player['created_at'])
        if isinstance(player.get('updated_at'), str):
            player['updated_at'] = datetime.fromisoformat(player['updated_at'])
    return players


@api_router.post("/admin/players", response_model=Player)
async def create_player(player_data: PlayerCreate, admin: dict = Depends(require_admin)):
    """Create new player (admin only)"""
    player = Player(**player_data.model_dump())
    
    doc = player.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    doc['updated_at'] = doc['updated_at'].isoformat()
    
    await db.players.insert_one(doc)
    return player


@api_router.put("/admin/players/{player_id}", response_model=Player)
async def update_player(player_id: str, player_data: PlayerUpdate, admin: dict = Depends(require_admin)):
    """Update player (admin only)"""
    existing_player = await db.players.find_one({"id": player_id}, {"_id": 0})
    if not existing_player:
        raise HTTPException(status_code=404, detail="Player not found")
    
    update_dict = {k: v for k, v in player_data.model_dump().items() if v is not None}
    update_dict['updated_at'] = datetime.now(timezone.utc).isoformat()
    
    await db.players.update_one({"id": player_id}, {"$set": update_dict})
    
    updated_player = await db.players.find_one({"id": player_id}, {"_id": 0})
    if isinstance(updated_player.get('created_at'), str):
        updated_player['created_at'] = datetime.fromisoformat(updated_player['created_at'])
    if isinstance(updated_player.get('updated_at'), str):
        updated_player['updated_at'] = datetime.fromisoformat(updated_player['updated_at'])
    
    return updated_player


@api_router.delete("/admin/players/{player_id}")
async def delete_player(player_id: str, admin: dict = Depends(require_admin)):
    """Delete player (admin only)"""
    result = await db.players.delete_one({"id": player_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Player not found")
    return {"message": "Player deleted successfully"}


# Player Routes (Member)
@api_router.get("/players/me", response_model=Player)
async def get_my_player(current_user: dict = Depends(get_current_user)):
    """Get current user's player data"""
    # Try to find by user_id first
    player = await db.players.find_one({"user_id": current_user["id"]}, {"_id": 0})
    
    # If not found, try by discord username
    if not player and current_user.get("discord_username"):
        player = await db.players.find_one({"nombre": current_user["discord_username"]}, {"_id": 0})
    
    if not player:
        raise HTTPException(status_code=404, detail="Player data not found")
    
    if isinstance(player.get('created_at'), str):
        player['created_at'] = datetime.fromisoformat(player['created_at'])
    if isinstance(player.get('updated_at'), str):
        player['updated_at'] = datetime.fromisoformat(player['updated_at'])
    
    return player


@api_router.put("/players/me", response_model=Player)
async def update_my_player(player_data: PlayerUpdate, current_user: dict = Depends(get_current_user)):
    """Update current user's player data"""
    # Try to find by user_id first
    player = await db.players.find_one({"user_id": current_user["id"]}, {"_id": 0})
    
    # If not found, try by discord username
    if not player and current_user.get("discord_username"):
        player = await db.players.find_one({"nombre": current_user["discord_username"]}, {"_id": 0})
    
    if not player:
        raise HTTPException(status_code=404, detail="Player data not found")
    
    # Members cannot change nombre (name)
    update_dict = {k: v for k, v in player_data.model_dump().items() if v is not None and k != 'nombre'}
    update_dict['updated_at'] = datetime.now(timezone.utc).isoformat()
    
    await db.players.update_one({"id": player["id"]}, {"$set": update_dict})
    
    updated_player = await db.players.find_one({"id": player["id"]}, {"_id": 0})
    if isinstance(updated_player.get('created_at'), str):
        updated_player['created_at'] = datetime.fromisoformat(updated_player['created_at'])
    if isinstance(updated_player.get('updated_at'), str):
        updated_player['updated_at'] = datetime.fromisoformat(updated_player['updated_at'])
    
    return updated_player


@api_router.get("/")
async def root():
    return {"message": "BDO Guild Management API"}


# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
