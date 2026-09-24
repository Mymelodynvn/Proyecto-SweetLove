export type PermissionKey =
  | 'dashboard'
  | 'reports'
  | 'products'
  | 'orders'
  | 'customers'
  | 'blog'
  | 'team'
  | 'settings'

export interface PermissionDefinition {
  key: PermissionKey
  label: string
}

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

export type TeamRoleName = 'Administrador' | 'Gerente' | 'Vendedor' | 'Repostero'

export interface RoleDefinition {
  name: TeamRoleName
  description: string
  permissions: PermissionKey[]
}

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

export const rolePermissions = (roleName: TeamRoleName): PermissionKey[] => {
  const role = TEAM_ROLES.find((definition) => definition.name === roleName)
  return role ? [...role.permissions] : []
}

export interface MemberActivity {
  title: string
  detail: string
  date: string
}

export interface TeamMember {
  id: number
  name: string
  email: string
  phone: string
  // Downscaled data URL; initials are the fallback when no photo is set.
  avatar: string | null
  role: TeamRoleName
  permissions: PermissionKey[]
  active: boolean
  joinedDate: string
  activity: MemberActivity[]
  // The store owner cannot be deleted or deactivated.
  isOwner: boolean
}

export type TeamMemberFormData = Omit<TeamMember, 'id' | 'joinedDate' | 'activity' | 'isOwner'>

const DEFAULT_TEAM = (): TeamMember[] => [
  {
    id: 1,
    name: 'Maryuri de Mendoza',
    email: 'maryuri@sweetlove.com',
    phone: '300 000 0000',
    avatar: null,
    role: 'Administrador',
    permissions: rolePermissions('Administrador'),
    active: true,
    joinedDate: 'ene 2020',
    activity: [
      { title: 'Publicó una nueva entrada en el blog', detail: 'Cómo elegimos los ingredientes de nuestras tortas', date: '15 ago 2026' },
      { title: 'Agregó un nuevo producto', detail: 'Cheesecake de frutos rojos', date: '12 ago 2026' },
      { title: 'Actualizó la configuración de la tienda', detail: 'Datos de contacto y ubicación', date: '8 ago 2026' },
    ],
    isOwner: true,
  },
  {
    id: 2,
    name: 'Daniela Cárdenas',
    email: 'daniela@sweetlove.com',
    phone: '310 555 2211',
    avatar: null,
    role: 'Gerente',
    permissions: rolePermissions('Gerente'),
    active: true,
    joinedDate: 'mar 2023',
    activity: [
      { title: 'Completó 25 pedidos esta semana', detail: 'Semana del 11 al 17 de agosto', date: '17 ago 2026' },
      { title: 'Exportó el reporte de ingresos', detail: 'Últimos 6 meses', date: '14 ago 2026' },
      { title: 'Actualizó el stock de 4 productos', detail: 'Cupcakes y cheesecakes', date: '11 ago 2026' },
    ],
    isOwner: false,
  },
  {
    id: 3,
    name: 'Paula Jiménez',
    email: 'paula@sweetlove.com',
    phone: '316 444 8899',
    avatar: null,
    role: 'Vendedor',
    permissions: rolePermissions('Vendedor'),
    active: true,
    joinedDate: 'jul 2024',
    activity: [
      { title: 'Registró 8 pedidos nuevos', detail: 'Principalmente por WhatsApp', date: '17 ago 2026' },
      { title: 'Marcó 6 pedidos como enviados', detail: 'Entregas en Medellín y Envigado', date: '16 ago 2026' },
    ],
    isOwner: false,
  },
  {
    id: 4,
    name: 'Miguel Ángel Rojas',
    email: 'miguel@sweetlove.com',
    phone: '302 777 1144',
    avatar: null,
    role: 'Repostero',
    permissions: rolePermissions('Repostero'),
    active: false,
    joinedDate: 'feb 2025',
    activity: [
      { title: 'Preparó 14 pedidos', detail: 'Antes de su licencia', date: '30 jul 2026' },
    ],
    isOwner: false,
  },
]

const formatJoinDate = () =>
  new Date().toLocaleDateString('es-CO', { month: 'short', year: 'numeric' })

export const useTeam = () => {
  const { state: members, loadFromStorage, persist } = usePersistentState<TeamMember[]>(
    'team-members',
    'sweet-love-admin-team',
    DEFAULT_TEAM,
  )

  const nextId = () => members.value.reduce((maxId, member) => Math.max(maxId, member.id), 0) + 1

  const addMember = (data: TeamMemberFormData) => {
    members.value.push({ ...data, id: nextId(), joinedDate: formatJoinDate(), activity: [], isOwner: false })
    persist()
  }

  const updateMember = (memberId: number, data: TeamMemberFormData) => {
    const target = members.value.find((member) => member.id === memberId)
    if (!target) return
    Object.assign(target, data)
    persist()
  }

  const toggleMemberActive = (memberId: number) => {
    const target = members.value.find((member) => member.id === memberId)
    if (!target || target.isOwner) return
    target.active = !target.active
    persist()
  }

  const removeMember = (memberId: number) => {
    members.value = members.value.filter((member) => member.id !== memberId || member.isOwner)
    persist()
  }

  return { members, loadFromStorage, addMember, updateMember, toggleMemberActive, removeMember }
}
