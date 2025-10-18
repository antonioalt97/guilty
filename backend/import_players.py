import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
import os
from dotenv import load_dotenv
from pathlib import Path
import uuid
from datetime import datetime, timezone

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# Sample players data based on Excel structure
# You can add more players here based on the guild roster
players_data = [
    {
        "id": str(uuid.uuid4()),
        "user_id": None,
        "nombre": "Kells",
        "clase_pvp": "Warrior",
        "spec": "Awakening",
        "ap": 310,
        "aap": 320,
        "dp": 400,
        "gs": 720.5,
        "builds": "Full damage build",
        "linkeo": "No",
        "print_gear_pvp": "",
        "created_at": datetime.now(timezone.utc).isoformat(),
        "updated_at": datetime.now(timezone.utc).isoformat()
    },
    {
        "id": str(uuid.uuid4()),
        "user_id": None,
        "nombre": "copium_",
        "clase_pvp": "Sorceress",
        "spec": "Awakening",
        "ap": 305,
        "aap": 315,
        "dp": 395,
        "gs": 715.0,
        "builds": "Balanced build",
        "linkeo": "Si",
        "print_gear_pvp": "",
        "created_at": datetime.now(timezone.utc).isoformat(),
        "updated_at": datetime.now(timezone.utc).isoformat()
    },
    {
        "id": str(uuid.uuid4()),
        "user_id": None,
        "nombre": "azphros",
        "clase_pvp": "Ninja",
        "spec": "Succession",
        "ap": 315,
        "aap": 325,
        "dp": 405,
        "gs": 725.0,
        "builds": "Hybrid build",
        "linkeo": "Si",
        "print_gear_pvp": "",
        "created_at": datetime.now(timezone.utc).isoformat(),
        "updated_at": datetime.now(timezone.utc).isoformat()
    },
    {
        "id": str(uuid.uuid4()),
        "user_id": None,
        "nombre": "fergoomy",
        "clase_pvp": "Guardian",
        "spec": "Awakening",
        "ap": 300,
        "aap": 310,
        "dp": 390,
        "gs": 710.0,
        "builds": "Tank build",
        "linkeo": "No",
        "print_gear_pvp": "",
        "created_at": datetime.now(timezone.utc).isoformat(),
        "updated_at": datetime.now(timezone.utc).isoformat()
    },
    {
        "id": str(uuid.uuid4()),
        "user_id": None,
        "nombre": "gonchi",
        "clase_pvp": "Lahn",
        "spec": "Awakening",
        "ap": 308,
        "aap": 318,
        "dp": 398,
        "gs": 718.0,
        "builds": "DPS build",
        "linkeo": "Si",
        "print_gear_pvp": "",
        "created_at": datetime.now(timezone.utc).isoformat(),
        "updated_at": datetime.now(timezone.utc).isoformat()
    },
    {
        "id": str(uuid.uuid4()),
        "user_id": None,
        "nombre": "furyyyyyyyy",
        "clase_pvp": "Berserker",
        "spec": "Succession",
        "ap": 312,
        "aap": 322,
        "dp": 402,
        "gs": 722.0,
        "builds": "Bruiser build",
        "linkeo": "Si",
        "print_gear_pvp": "",
        "created_at": datetime.now(timezone.utc).isoformat(),
        "updated_at": datetime.now(timezone.utc).isoformat()
    },
    {
        "id": str(uuid.uuid4()),
        "user_id": None,
        "nombre": "pastabase",
        "clase_pvp": "Ranger",
        "spec": "Awakening",
        "ap": 307,
        "aap": 317,
        "dp": 397,
        "gs": 717.0,
        "builds": "Ranged DPS",
        "linkeo": "No",
        "print_gear_pvp": "",
        "created_at": datetime.now(timezone.utc).isoformat(),
        "updated_at": datetime.now(timezone.utc).isoformat()
    }
]


async def import_players():
    # MongoDB connection
    mongo_url = os.environ['MONGO_URL']
    client = AsyncIOMotorClient(mongo_url)
    db = client[os.environ['DB_NAME']]
    
    try:
        # Check if players already exist
        existing_count = await db.players.count_documents({})
        
        if existing_count > 0:
            print(f"Found {existing_count} existing players in database.")
            response = input("Do you want to clear and reimport? (yes/no): ")
            if response.lower() == 'yes':
                result = await db.players.delete_many({})
                print(f"Deleted {result.deleted_count} players.")
            else:
                print("Import cancelled.")
                return
        
        # Insert players
        result = await db.players.insert_many(players_data)
        print(f"Successfully imported {len(result.inserted_ids)} players!")
        
        # Display imported players
        print("\nImported players:")
        for player in players_data:
            print(f"  - {player['nombre']} ({player['clase_pvp']} - {player['spec']}) GS: {player['gs']}")
        
    except Exception as e:
        print(f"Error importing players: {e}")
    finally:
        client.close()


if __name__ == "__main__":
    asyncio.run(import_players())
