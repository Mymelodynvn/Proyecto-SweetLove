// use-team.ts — equipo de trabajo del panel
export type PermissionKey =
  | 'dashboard'
  | 'reports'
  | 'products'
  | 'orders'
  | 'customers'
  | 'blog'
  | 'team'
  | 'settings'

// Permiso con su etiqueta legible
export interface PermissionDefinition {
  key: PermissionKey
  label: string
}

// Catálogo de permisos disponibles
export const PERMISSIONS: PermissionDefinition[] = [
  { key: 'dashboard', label: 'Ver panel y estadísticas' },
  { key: 'reports', label: 'Ver reportes' },
  { key: 'products', label: 'Gestionar productos' },
  { key: 'orders', label: 'Gestionar pedidos' },
  { key: 'customers', label: 'Ver clientes' },
  { key: 'blog', label: 'Gestionar blog' },
  { key: 'team', label: 'Gestionar equipo' },
  { key: 'settings', label: 'Configuración de la tienda' },
]

// Roles posibles dentro del equipo
export type TeamRoleName = 'Administrador' | 'Gerente' | 'Vendedor' | 'Repostero'

// Rol con su descripción y los permisos que otorga por defecto
export interface RoleDefinition {
  name: TeamRoleName
  description: string
  permissions: PermissionKey[]
}

// Catálogo de roles y sus permisos predeterminados
export const TEAM_ROLES: RoleDefinition[] = [
  {
    name: 'Administrador',
    description: 'Acceso total a todas las opciones del panel.',
    permissions: ['dashboard', 'reports', 'products', 'orders', 'customers', 'blog', 'team', 'settings'],
  },
  {
    name: 'Gerente',
    description: 'Opera toda la tienda y el equipo, sin tocar la configuración.',
    permissions: ['dashboard', 'reports', 'products', 'orders', 'customers', 'blog', 'team'],
  },
  {
    name: 'Vendedor',
    description: 'Atiende pedidos y clientes del día a día.',
    permissions: ['dashboard', 'orders', 'customers'],
  },
  {
    name: 'Repostero',
    description: 'Gestiona el catálogo y la preparación de pedidos.',
    permissions: ['products', 'orders'],
  },
]

// Permisos que otorga un rol por defecto, recibe roleName
export const rolePermissions = (roleName: TeamRoleName): PermissionKey[] => {
  const role = TEAM_ROLES.find((definition) => definition.name === roleName)
  return role ? [...role.permissions] : []
}

// Registro de actividad reciente de un miembro
export interface MemberActivity {
  title: string
  detail: string
  date: string
}

// Miembro del equipo
export interface TeamMember {
  id: number
  name: string
  email: string
  phone: string
  // La imagen se guarda como Data URL; las iniciales son el respaldo cuando no hay fotografía.
  avatar: string | null
  role: TeamRoleName
  permissions: PermissionKey[]
  active: boolean
  joinedDate: string
  activity: MemberActivity[]
  // La persona propietaria de la tienda no puede eliminarse ni desactivarse.
  isOwner: boolean
}

// Campos editables desde el formulario (el resto lo asigna el sistema)
export type TeamMemberFormData = Omit<TeamMember, 'id' | 'joinedDate' | 'activity' | 'isOwner'>

// Equipo: vacío hasta que la persona administradora agregue a su equipo real
const DEFAULT_TEAM = (): TeamMember[] => []

// Fecha de hoy en formato corto, para registrar el ingreso de un miembro
const formatJoinDate = () =>
  new Date().toLocaleDateString('es-CO', { month: 'short', year: 'numeric' })

// Composable del equipo
export const useTeam = () => {
  const { state: members, loadFromStorage, persist } = usePersistentState<TeamMember[]>(
    'team-members',
    'sweet-love-admin-team',
    DEFAULT_TEAM,
  )

  // Siguiente identificador libre (máximo actual + 1)
  const nextId = () => members.value.reduce((maxId, member) => Math.max(maxId, member.id), 0) + 1

  // Agrega un miembro nuevo y guarda el cambio, recibe data
  const addMember = (data: TeamMemberFormData) => {
    members.value.push({ ...data, id: nextId(), joinedDate: formatJoinDate(), activity: [], isOwner: false })
    persist()
  }

  // Actualiza un miembro existente y guarda el cambio, recibe memberId, data
  const updateMember = (memberId: number, data: TeamMemberFormData) => {
    const target = members.value.find((member) => member.id === memberId)
    if (!target) return
    Object.assign(target, data)
    persist()
  }

  // Activa o desactiva a un miembro y guarda el cambio, recibe memberId
  const toggleMemberActive = (memberId: number) => {
    const target = members.value.find((member) => member.id === memberId)
    if (!target || target.isOwner) return
    target.active = !target.active
    persist()
  }

  // Elimina a un miembro y guarda el cambio, recibe memberId
  const removeMember = (memberId: number) => {
    members.value = members.value.filter((member) => member.id !== memberId || member.isOwner)
    persist()
  }

  return { members, loadFromStorage, addMember, updateMember, toggleMemberActive, removeMember }
}
