import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '@/App';
import axios from 'axios';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { LogOut, User, Edit, Save, X } from 'lucide-react';
import { toast } from 'sonner';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export default function MemberDashboard() {
  const { user, logout, token } = useContext(AuthContext);
  const [player, setPlayer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({});

  useEffect(() => {
    fetchPlayerData();
  }, []);

  const fetchPlayerData = async () => {
    try {
      const response = await axios.get(`${API}/players/me`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setPlayer(response.data);
      setFormData({
        clase_pvp: response.data.clase_pvp,
        spec: response.data.spec,
        ap: response.data.ap,
        aap: response.data.aap,
        dp: response.data.dp,
        gs: response.data.gs,
        builds: response.data.builds,
        linkeo: response.data.linkeo,
        print_gear_pvp: response.data.print_gear_pvp
      });
    } catch (error) {
      toast.error('Error al cargar tus datos');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      const response = await axios.put(`${API}/players/me`, formData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setPlayer(response.data);
      setEditing(false);
      toast.success('Datos actualizados exitosamente');
    } catch (error) {
      toast.error('Error al actualizar datos');
      console.error(error);
    }
  };

  const handleCancel = () => {
    setFormData({
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
    setEditing(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 flex items-center justify-center">
        <div className="text-white text-2xl">Cargando...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white">
      {/* Header */}
      <header className="glass-dark border-b border-purple-500/20">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <User className="w-8 h-8 text-purple-400" />
            <div>
              <h1 className="text-2xl font-bold">Mi Perfil</h1>
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
        <div className="max-w-4xl mx-auto">
          {!player ? (
            <Card className="glass-dark p-12 text-center">
              <p className="text-gray-400 text-lg">No se encontraron datos de jugador asociados a tu cuenta.</p>
              <p className="text-sm text-gray-500 mt-2">Contacta a un administrador del gremio.</p>
            </Card>
          ) : (
            <Card className="glass-dark p-8">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-3xl font-bold text-purple-400">{player.nombre}</h2>
                {!editing ? (
                  <Button
                    data-testid="edit-profile-btn"
                    onClick={() => setEditing(true)}
                    className="bg-purple-600 hover:bg-purple-700"
                  >
                    <Edit className="w-4 h-4 mr-2" />
                    Editar
                  </Button>
                ) : (
                  <div className="flex gap-2">
                    <Button
                      data-testid="save-profile-btn"
                      onClick={handleSave}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      <Save className="w-4 h-4 mr-2" />
                      Guardar
                    </Button>
                    <Button
                      data-testid="cancel-edit-btn"
                      onClick={handleCancel}
                      variant="outline"
                      className="border-gray-600 text-gray-300"
                    >
                      <X className="w-4 h-4 mr-2" />
                      Cancelar
                    </Button>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label className="text-gray-400">Clase PvP</Label>
                  {editing ? (
                    <Input
                      data-testid="edit-clase-input"
                      value={formData.clase_pvp}
                      onChange={(e) => setFormData({...formData, clase_pvp: e.target.value})}
                      className="bg-slate-800 border-purple-500/30 text-white mt-1"
                    />
                  ) : (
                    <p className="text-lg font-semibold mt-1">{player.clase_pvp}</p>
                  )}
                </div>

                <div>
                  <Label className="text-gray-400">Spec</Label>
                  {editing ? (
                    <Input
                      data-testid="edit-spec-input"
                      value={formData.spec}
                      onChange={(e) => setFormData({...formData, spec: e.target.value})}
                      className="bg-slate-800 border-purple-500/30 text-white mt-1"
                    />
                  ) : (
                    <p className="text-lg font-semibold mt-1">{player.spec}</p>
                  )}
                </div>

                <div>
                  <Label className="text-gray-400">AP (Attack Power)</Label>
                  {editing ? (
                    <Input
                      type="number"
                      data-testid="edit-ap-input"
                      value={formData.ap}
                      onChange={(e) => setFormData({...formData, ap: parseInt(e.target.value) || 0})}
                      className="bg-slate-800 border-purple-500/30 text-white mt-1"
                    />
                  ) : (
                    <p className="text-lg font-semibold mt-1">{player.ap}</p>
                  )}
                </div>

                <div>
                  <Label className="text-gray-400">AAP (Ability Attack Power)</Label>
                  {editing ? (
                    <Input
                      type="number"
                      data-testid="edit-aap-input"
                      value={formData.aap}
                      onChange={(e) => setFormData({...formData, aap: parseInt(e.target.value) || 0})}
                      className="bg-slate-800 border-purple-500/30 text-white mt-1"
                    />
                  ) : (
                    <p className="text-lg font-semibold mt-1">{player.aap}</p>
                  )}
                </div>

                <div>
                  <Label className="text-gray-400">DP (Defense Power)</Label>
                  {editing ? (
                    <Input
                      type="number"
                      data-testid="edit-dp-input"
                      value={formData.dp}
                      onChange={(e) => setFormData({...formData, dp: parseInt(e.target.value) || 0})}
                      className="bg-slate-800 border-purple-500/30 text-white mt-1"
                    />
                  ) : (
                    <p className="text-lg font-semibold mt-1">{player.dp}</p>
                  )}
                </div>

                <div>
                  <Label className="text-gray-400">GS (Gear Score)</Label>
                  {editing ? (
                    <Input
                      type="number"
                      step="0.1"
                      data-testid="edit-gs-input"
                      value={formData.gs}
                      onChange={(e) => setFormData({...formData, gs: parseFloat(e.target.value) || 0})}
                      className="bg-slate-800 border-purple-500/30 text-white mt-1"
                    />
                  ) : (
                    <p className="text-lg font-semibold text-green-400 mt-1">{player.gs}</p>
                  )}
                </div>

                <div>
                  <Label className="text-gray-400">Linkeo</Label>
                  {editing ? (
                    <Input
                      data-testid="edit-linkeo-input"
                      value={formData.linkeo}
                      onChange={(e) => setFormData({...formData, linkeo: e.target.value})}
                      className="bg-slate-800 border-purple-500/30 text-white mt-1"
                    />
                  ) : (
                    <p className="text-lg font-semibold mt-1">{player.linkeo}</p>
                  )}
                </div>

                <div>
                  <Label className="text-gray-400">Builds</Label>
                  {editing ? (
                    <Input
                      data-testid="edit-builds-input"
                      value={formData.builds}
                      onChange={(e) => setFormData({...formData, builds: e.target.value})}
                      className="bg-slate-800 border-purple-500/30 text-white mt-1"
                    />
                  ) : (
                    <p className="text-lg font-semibold mt-1">{player.builds}</p>
                  )}
                </div>

                <div className="md:col-span-2">
                  <Label className="text-gray-400">PRINT GEAR PvP</Label>
                  {editing ? (
                    <Input
                      data-testid="edit-printgear-input"
                      value={formData.print_gear_pvp}
                      onChange={(e) => setFormData({...formData, print_gear_pvp: e.target.value})}
                      className="bg-slate-800 border-purple-500/30 text-white mt-1"
                      placeholder="URL del screenshot de tu gear"
                    />
                  ) : (
                    player.print_gear_pvp ? (
                      <a href={player.print_gear_pvp} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline text-lg block mt-1">
                        Ver mi Gear
                      </a>
                    ) : (
                      <p className="text-gray-500 mt-1">No disponible</p>
                    )
                  )}
                </div>
              </div>
            </Card>
          )}
        </div>
      </main>
    </div>
  );
}
