<script setup lang="ts">
import {
  IconCake,
  IconChartBar,
  IconChevronRight,
  IconFile,
  IconLayoutDashboard,
  IconLock,
  IconLogout,
  IconNews,
  IconSelector,
  IconSettings,
  IconShoppingCart,
  IconStar,
  IconUser,
  IconUsers,
  IconUsersGroup,
} from '@tabler/icons-vue'
import type { Component } from 'vue'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarRail,
  useSidebar,
} from '~/components/ui/sidebar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '~/components/ui/dropdown-menu'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '~/components/ui/collapsible'
import { Avatar, AvatarFallback, AvatarImage } from '~/components/ui/avatar'

interface NavLink {
  title: string
  to: string
  icon: Component
}

interface NavSection {
  title: string
  icon: Component
  children: { title: string, to: string }[]
}

const route = useRoute()
const { profile, initials: profileInitials } = useProfile()
const { isMobile } = useSidebar()

const mainLinks: NavLink[] = [
  { title: 'Panel', to: '/', icon: IconLayoutDashboard },
  { title: 'Reportes', to: '/reports', icon: IconChartBar },
]

const storeLinks: NavLink[] = [
  { title: 'Productos', to: '/products', icon: IconCake },
  { title: 'Pedidos', to: '/orders', icon: IconShoppingCart },
  { title: 'Clientes', to: '/customers', icon: IconUsers },
  { title: 'Destacados', to: '/highlights', icon: IconStar },
  { title: 'Blog', to: '/blog', icon: IconNews },
]

const accountLinks: NavLink[] = [
  { title: 'Perfil', to: '/profile', icon: IconUser },
  { title: 'Equipo', to: '/team', icon: IconUsersGroup },
  { title: 'Configuración', to: '/settings', icon: IconSettings },
]

const pageSections: NavSection[] = [
  {
    title: 'Páginas',
    icon: IconFile,
    children: [
      { title: 'Mantenimiento', to: '/error/maintenance' },
      { title: 'Error 404', to: '/error/not-found' },
    ],
  },
  {
    title: 'Autenticación',
    icon: IconLock,
    children: [
      { title: 'Iniciar sesión', to: '/auth/sign-in' },
      { title: 'Registrarse', to: '/auth/sign-up' },
      { title: 'Olvidé mi contraseña', to: '/auth/forgot-password' },
      { title: 'Restablecer contraseña', to: '/auth/reset-password' },
      { title: 'Verificación OTP', to: '/auth/otp-verification' },
    ],
  },
]

const extraLinks: NavLink[] = [
  { title: 'Página en blanco', to: '/blank', icon: IconFile },
]

const isSectionOpen = (section: NavSection) =>
  section.children.some((child) => child.to === route.path)
</script>

<template>
  <Sidebar collapsible="icon">
    <SidebarHeader>
      <SidebarMenu>
        <SidebarMenuItem>
          <SidebarMenuButton size="lg" as-child>
            <NuxtLink to="/">
              <div class="bg-primary text-primary-foreground flex aspect-square size-8 items-center justify-center rounded-full">
                <IconCake class="size-5" />
              </div>
              <div class="grid flex-1 text-left leading-tight">
                <span class="truncate font-heading text-base font-bold">Sweet Love</span>
                <span class="text-sidebar-foreground/70 truncate text-xs">Handmade Cakes</span>
              </div>
            </NuxtLink>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
    </SidebarHeader>

    <SidebarContent>
      <SidebarGroup>
        <SidebarGroupLabel>Panel</SidebarGroupLabel>
        <SidebarGroupContent>
          <SidebarMenu>
            <SidebarMenuItem v-for="link in mainLinks" :key="link.to">
              <SidebarMenuButton :tooltip="link.title" :is-active="route.path === link.to" as-child>
                <NuxtLink :to="link.to">
                  <component :is="link.icon" />
                  <span>{{ link.title }}</span>
                </NuxtLink>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup>

      <SidebarGroup>
        <SidebarGroupLabel>Tienda</SidebarGroupLabel>
        <SidebarGroupContent>
          <SidebarMenu>
            <SidebarMenuItem v-for="link in storeLinks" :key="link.to">
              <SidebarMenuButton :tooltip="link.title" :is-active="route.path === link.to" as-child>
                <NuxtLink :to="link.to">
                  <component :is="link.icon" />
                  <span>{{ link.title }}</span>
                </NuxtLink>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup>

      <SidebarGroup>
        <SidebarGroupLabel>Cuenta</SidebarGroupLabel>
        <SidebarGroupContent>
          <SidebarMenu>
            <SidebarMenuItem v-for="link in accountLinks" :key="link.to">
              <SidebarMenuButton :tooltip="link.title" :is-active="route.path === link.to" as-child>
                <NuxtLink :to="link.to">
                  <component :is="link.icon" />
                  <span>{{ link.title }}</span>
                </NuxtLink>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup>

      <SidebarGroup>
        <SidebarGroupLabel>Páginas</SidebarGroupLabel>
        <SidebarGroupContent>
          <SidebarMenu>
            <Collapsible
              v-for="section in pageSections"
              :key="section.title"
              :default-open="isSectionOpen(section)"
              class="group/collapsible"
              as-child
            >
              <SidebarMenuItem>
                <CollapsibleTrigger as-child>
                  <SidebarMenuButton :tooltip="section.title">
                    <component :is="section.icon" />
                    <span>{{ section.title }}</span>
                    <IconChevronRight class="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                  </SidebarMenuButton>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <SidebarMenuSub>
                    <SidebarMenuSubItem v-for="child in section.children" :key="child.to">
                      <SidebarMenuSubButton :is-active="route.path === child.to" as-child>
                        <NuxtLink :to="child.to">
                          <span>{{ child.title }}</span>
                        </NuxtLink>
                      </SidebarMenuSubButton>
                    </SidebarMenuSubItem>
                  </SidebarMenuSub>
                </CollapsibleContent>
              </SidebarMenuItem>
            </Collapsible>
            <SidebarMenuItem v-for="link in extraLinks" :key="link.to">
              <SidebarMenuButton :tooltip="link.title" :is-active="route.path === link.to" as-child>
                <NuxtLink :to="link.to">
                  <component :is="link.icon" />
                  <span>{{ link.title }}</span>
                </NuxtLink>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup>
    </SidebarContent>

    <SidebarFooter>
      <SidebarMenu>
        <SidebarMenuItem>
          <DropdownMenu>
            <DropdownMenuTrigger as-child>
              <SidebarMenuButton
                size="lg"
                class="data-open:bg-sidebar-accent data-open:text-sidebar-accent-foreground"
                aria-label="Menú de usuario"
              >
                <Avatar class="size-8">
                  <AvatarImage v-if="profile.avatar" :src="profile.avatar" :alt="profile.name" />
                  <AvatarFallback class="bg-primary text-primary-foreground text-xs font-semibold">
                    {{ profileInitials }}
                  </AvatarFallback>
                </Avatar>
                <div class="grid flex-1 text-left text-sm leading-tight">
                  <span class="truncate font-semibold">{{ profile.name }}</span>
                  <span class="text-sidebar-foreground/70 truncate text-xs">{{ profile.role }}</span>
                </div>
                <IconSelector class="ml-auto size-4" />
              </SidebarMenuButton>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              class="w-(--reka-dropdown-menu-trigger-width) min-w-56"
              :side="isMobile ? 'bottom' : 'right'"
              align="end"
              :side-offset="4"
            >
              <DropdownMenuLabel>
                <p class="text-sm font-semibold">{{ profile.name }}</p>
                <p class="text-muted-foreground text-xs font-normal">{{ profile.role }}</p>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem as-child>
                <NuxtLink to="/profile">
                  <IconUser class="size-4" />
                  Mi perfil
                </NuxtLink>
              </DropdownMenuItem>
              <DropdownMenuItem as-child>
                <NuxtLink to="/settings">
                  <IconSettings class="size-4" />
                  Configuración
                </NuxtLink>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem as-child>
                <NuxtLink to="/auth/sign-in">
                  <IconLogout class="size-4" />
                  Cerrar sesión
                </NuxtLink>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </SidebarMenuItem>
      </SidebarMenu>
    </SidebarFooter>
    <SidebarRail />
  </Sidebar>
</template>
