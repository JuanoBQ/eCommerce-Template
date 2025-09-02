"use client"

import { useState } from 'react'
import { Users, Search, Filter, MoreVertical, Edit, Trash2, Eye } from 'lucide-react'

// Mock data para usuarios
const mockUsers = [
  {
    id: 1,
    email: 'admin@tienda.com',
    first_name: 'Admin',
    last_name: 'Usuario',
    is_admin: true,
    is_active: true,
    date_joined: '2024-01-01',
    last_login: '2024-01-15'
  },
  {
    id: 2,
    email: 'cliente@email.com',
    first_name: 'Juan',
    last_name: 'Pérez',
    is_admin: false,
    is_active: true,
    date_joined: '2024-01-10',
    last_login: '2024-01-14'
  }
]

export default function UsersPage() {
  const [users] = useState(mockUsers)
  const [searchTerm, setSearchTerm] = useState('')

  const filteredUsers = users.filter(user =>
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.last_name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Usuarios</h1>
          <p className="text-dark-400 mt-2">Gestiona los usuarios del sistema</p>
        </div>
        <button className="px-4 py-2 bg-neon-green text-dark-900 font-medium rounded-lg hover:bg-neon-green/90 transition-colors">
          Nuevo Usuario
        </button>
      </div>

      {/* Filters */}
      <div className="bg-dark-800 border border-dark-700 rounded-xl p-6">
        <div className="flex items-center space-x-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-dark-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Buscar usuarios..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-dark-700 border border-dark-600 rounded-lg text-white placeholder-dark-400 focus:outline-none focus:ring-2 focus:ring-neon-green focus:border-transparent"
            />
          </div>
          <button className="px-4 py-2 bg-dark-700 border border-dark-600 rounded-lg text-white hover:bg-dark-600 transition-colors flex items-center space-x-2">
            <Filter className="w-4 h-4" />
            <span>Filtros</span>
          </button>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-dark-800 border border-dark-700 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-dark-700">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-medium text-white">Usuario</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-white">Email</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-white">Rol</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-white">Estado</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-white">Último Acceso</th>
                <th className="px-6 py-4 text-right text-sm font-medium text-white">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-dark-700">
              {filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-dark-700/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-neon-green rounded-full flex items-center justify-center">
                        <span className="text-dark-900 font-semibold">
                          {user.first_name[0]}{user.last_name[0]}
                        </span>
                      </div>
                      <div>
                        <div className="text-white font-medium">
                          {user.first_name} {user.last_name}
                        </div>
                        <div className="text-dark-400 text-sm">
                          ID: {user.id}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-white">{user.email}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      user.is_admin 
                        ? 'bg-red-500/20 text-red-400' 
                        : 'bg-blue-500/20 text-blue-400'
                    }`}>
                      {user.is_admin ? 'Administrador' : 'Cliente'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      user.is_active 
                        ? 'bg-green-500/20 text-green-400' 
                        : 'bg-gray-500/20 text-gray-400'
                    }`}>
                      {user.is_active ? 'Activo' : 'Inactivo'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-dark-400">
                    {new Date(user.last_login).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end space-x-2">
                      <button className="p-2 text-dark-400 hover:text-white transition-colors" title="Ver">
                        <Eye className="w-4 h-4" />
                      </button>
                      <button className="p-2 text-dark-400 hover:text-white transition-colors" title="Editar">
                        <Edit className="w-4 h-4" />
                      </button>
                      <button className="p-2 text-dark-400 hover:text-red-400 transition-colors" title="Eliminar">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-dark-800 border border-dark-700 rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-dark-400 text-sm">Total Usuarios</p>
              <p className="text-2xl font-bold text-white">{users.length}</p>
            </div>
            <Users className="w-8 h-8 text-neon-green" />
          </div>
        </div>
        <div className="bg-dark-800 border border-dark-700 rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-dark-400 text-sm">Administradores</p>
              <p className="text-2xl font-bold text-white">
                {users.filter(u => u.is_admin).length}
              </p>
            </div>
            <Users className="w-8 h-8 text-red-400" />
          </div>
        </div>
        <div className="bg-dark-800 border border-dark-700 rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-dark-400 text-sm">Clientes</p>
              <p className="text-2xl font-bold text-white">
                {users.filter(u => !u.is_admin).length}
              </p>
            </div>
            <Users className="w-8 h-8 text-blue-400" />
          </div>
        </div>
        <div className="bg-dark-800 border border-dark-700 rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-dark-400 text-sm">Usuarios Activos</p>
              <p className="text-2xl font-bold text-white">
                {users.filter(u => u.is_active).length}
              </p>
            </div>
            <Users className="w-8 h-8 text-green-400" />
          </div>
        </div>
      </div>
    </div>
  )
}