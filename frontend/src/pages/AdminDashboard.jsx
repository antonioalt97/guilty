import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '@/App';
import axios from 'axios';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { LogOut, Plus, Edit, Trash2, Shield, User } from 'lucide-react';
import { toast } from 'sonner';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export default function AdminDashboard() {
  const { user, logout, token } = useContext(AuthContext);
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingPlayer, setEditingPlayer] = useState(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    nombre: '',
    clase_pvp: '',
    spec: '',
    ap: 0,
    aap: 0,
    dp: 0,
    gs: 0,
    builds: '',
    linkeo: 'No',
    print_gear_pvp: ''
  });

  useEffect(() => {
    fetchPlayers();
  }, []);

  const fetchPlayers = async () => {
    try {
      const response = await axios.get(`${API}/admin/players`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setPlayers(response.data);
    } catch (error) {
      toast.error('Error al cargar jugadores');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      if (editingPlayer) {
        await axios.put(`${API}/admin/players/${editingPlayer.id}`, formData, {
          headers: { Authorization: `Bearer ${token}` }
        });
        toast.success('Jugador actualizado exitosamente');
      } else {
        await axios.post(`${API}/admin/players`, formData, {
          headers: { Authorization: `Bearer ${token}` }
        });
        toast.success('Jugador creado exitosamente');
      }
      
      setIsDialogOpen(false);
      setEditingPlayer(null);
      resetForm();
      fetchPlayers();
    } catch (error) {
      toast.error('Error al guardar jugador');
      console.error(error);
    }
  };

  const handleDelete = async (playerId) => {
    if (!window.confirm('¿Estás seguro de eliminar este jugador?')) return;
    
    try {
      await axios.delete(`${API}/admin/players/${playerId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Jugador eliminado exitosamente');
      fetchPlayers();
    } catch (error) {
      toast.error('Error al eliminar jugador');
      console.error(error);
    }
  };

  const resetForm = () => {
    setFormData({
      nombre: '',
      clase_pvp: '',
      spec: '',
      ap: 0,
      aap: 0,
      dp: 0,
      gs: 0,
      builds: '',
      linkeo: 'No',
      print_gear_pvp: ''
    });
  };

  const openEditDialog = (player) => {
    setEditingPlayer(player);
    setFormData({
      nombre: player.nombre,
      clase_pvp: player.clase_pvp,
      spec: player.spec,
      ap: player.ap,
      aap: player.aap,
      dp: player.dp,
      gs: player.gs,
      builds: player.builds,
      linkeo: player.linkeo,
      print_gear_pvp: player.print_gear_pvp
    });
    setIsDialogOpen(true);
  };

  const openCreateDialog = () => {
    setEditingPlayer(null);
    resetForm();
    setIsDialogOpen(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white">
      {/* Header */}
      <header className="glass-dark border-b border-purple-500/20">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <Shield className="w-8 h-8 text-purple-400" />
            <div>
              <h1 className="text-2xl font-bold">Panel de Administración</h1>
              <p className="text-sm text-gray-400">Bienvenido, {user?.name}</p>
            </div>
          </div>
          <Button
            data-testid="logout-btn"
            onClick={logout}
            variant="outline"
            className="border-red-500/50 text-red-400 hover:bg-red-500/10"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Salir
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-3xl font-bold">Jugadores del Gremio</h2>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button
                data-testid="add-player-btn"
                onClick={openCreateDialog}
                className="bg-purple-600 hover:bg-purple-700 text-white"
              >
                <Plus className="w-4 h-4 mr-2" />
                Agregar Jugador
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-slate-900 text-white border-purple-500/20">
              <DialogHeader>
                <DialogTitle className="text-2xl text-white">
                  {editingPlayer ? 'Editar Jugador' : 'Nuevo Jugador'}
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4 mt-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="nombre" className="text-white">Nombre</Label>
                    <Input
                      id="nombre"
                      data-testid="player-nombre-input"
                      value={formData.nombre}
                      onChange={(e) => setFormData({...formData, nombre: e.target.value})}
                      required
                      className="bg-slate-800 border-purple-500/30 text-white"
                    />
                  </div>
                  <div>
                    <Label htmlFor="clase_pvp" className="text-white">Clase PvP</Label>
                    <Input
                      id="clase_pvp"
                      data-testid="player-clase-input"
                      value={formData.clase_pvp}
                      onChange={(e) => setFormData({...formData, clase_pvp: e.target.value})}
                      required
                      className="bg-slate-800 border-purple-500/30 text-white"
                    />
                  </div>
                  <div>
                    <Label htmlFor="spec" className="text-white">Spec</Label>
                    <Input
                      id="spec"
                      data-testid="player-spec-input"
                      value={formData.spec}
                      onChange={(e) => setFormData({...formData, spec: e.target.value})}
                      required
                      className="bg-slate-800 border-purple-500/30 text-white"
                    />
                  </div>
                  <div>
                    <Label htmlFor="ap" className="text-white">AP</Label>
                    <Input
                      id="ap"
                      type="number"
                      data-testid="player-ap-input"
                      value={formData.ap}
                      onChange={(e) => setFormData({...formData, ap: parseInt(e.target.value) || 0})}
                      required
                      className="bg-slate-800 border-purple-500/30 text-white"
                    />
                  </div>
                  <div>
                    <Label htmlFor="aap" className="text-white">AAP</Label>
                    <Input
                      id="aap"
                      type="number"
                      data-testid="player-aap-input"
                      value={formData.aap}
                      onChange={(e) => setFormData({...formData, aap: parseInt(e.target.value) || 0})}
                      required
                      className="bg-slate-800 border-purple-500/30 text-white"
                    />
                  </div>
                  <div>
                    <Label htmlFor="dp" className="text-white">DP</Label>
                    <Input
                      id="dp"
                      type="number"
                      data-testid="player-dp-input"
                      value={formData.dp}
                      onChange={(e) => setFormData({...formData, dp: parseInt(e.target.value) || 0})}
                      required
                      className="bg-slate-800 border-purple-500/30 text-white"
                    />
                  </div>
                  <div>
                    <Label htmlFor="gs" className="text-white">GS</Label>
                    <Input
                      id="gs"
                      type="number"
                      step="0.1"
                      data-testid="player-gs-input"
                      value={formData.gs}
                      onChange={(e) => setFormData({...formData, gs: parseFloat(e.target.value) || 0})}
                      required
                      className="bg-slate-800 border-purple-500/30 text-white"
                    />
                  </div>
                  <div>
                    <Label htmlFor="linkeo" className="text-white">Linkeo</Label>
                    <Input
                      id="linkeo"
                      data-testid="player-linkeo-input"
                      value={formData.linkeo}
                      onChange={(e) => setFormData({...formData, linkeo: e.target.value})}
                      required
                      className="bg-slate-800 border-purple-500/30 text-white"
                    />
                  </div>
                  <div className="col-span-2">
                    <Label htmlFor="builds" className="text-white">Builds</Label>
                    <Input
                      id="builds"
                      data-testid="player-builds-input"
                      value={formData.builds}
                      onChange={(e) => setFormData({...formData, builds: e.target.value})}
                      required
                      className="bg-slate-800 border-purple-500/30 text-white"
                    />
                  </div>
                  <div className="col-span-2">
                    <Label htmlFor="print_gear_pvp" className="text-white">PRINT GEAR PvP (URL)</Label>
                    <Input
                      id="print_gear_pvp"
                      data-testid="player-printgear-input"
                      value={formData.print_gear_pvp}
                      onChange={(e) => setFormData({...formData, print_gear_pvp: e.target.value})}
                      required
                      className="bg-slate-800 border-purple-500/30 text-white"
                    />
                  </div>
                </div>
                <div className="flex gap-4 pt-4">
                  <Button
                    type="submit"
                    data-testid="save-player-btn"
                    className="flex-1 bg-purple-600 hover:bg-purple-700"
                  >
                    {editingPlayer ? 'Actualizar' : 'Crear'}
                  </Button>
                  <Button
                    type="button"
                    onClick={() => setIsDialogOpen(false)}
                    variant="outline"
                    className="flex-1 border-gray-600 text-gray-300"
                  >
                    Cancelar
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {loading ? (
          <div className="text-center py-20 text-gray-400">Cargando...</div>
        ) : players.length === 0 ? (
          <Card className="glass-dark p-12 text-center">
            <p className="text-gray-400 text-lg">No hay jugadores registrados</p>
          </Card>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {players.map((player) => (
              <Card key={player.id} data-testid={`player-card-${player.id}`} className="glass-dark p-6 hover:border-purple-500/30 transition-all">
                <div className="flex justify-between items-start">
                  <div className="flex-1 grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <p className="text-sm text-gray-400">Nombre</p>
                      <p className="font-bold text-purple-400 text-lg">{player.nombre}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-400">Clase / Spec</p>
                      <p className="font-semibold">{player.clase_pvp} - {player.spec}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-400">Stats</p>
                      <p className="text-sm">AP: {player.ap} | AAP: {player.aap} | DP: {player.dp}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-400">GS</p>
                      <p className="font-bold text-green-400 text-lg">{player.gs}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-400">Builds</p>
                      <p className="text-sm">{player.builds}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-400">Linkeo</p>
                      <p className="text-sm">{player.linkeo}</p>
                    </div>
                    <div className="col-span-2">
                      <p className="text-sm text-gray-400">Print Gear</p>
                      {player.print_gear_pvp ? (
                        <a href={player.print_gear_pvp} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline text-sm">
                          Ver Gear
                        </a>
                      ) : (
                        <p className="text-sm text-gray-500">No disponible</p>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2 ml-4">
                    <Button
                      data-testid={`edit-player-${player.id}`}
                      onClick={() => openEditDialog(player)}
                      size="sm"
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      data-testid={`delete-player-${player.id}`}
                      onClick={() => handleDelete(player.id)}
                      size="sm"
                      className="bg-red-600 hover:bg-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
