<script setup lang="ts">
import { IconLogout, IconSearch, IconSettings, IconUser } from '@tabler/icons-vue'
import { SidebarTrigger } from '~/components/ui/sidebar'
import { Separator } from '~/components/ui/separator'
import { Input } from '~/components/ui/input'
import { Button } from '~/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '~/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '~/components/ui/dropdown-menu'

const { profile, initials: profileInitials, firstName } = useProfile()
</script>

<template>
  <header class="bg-background/80 sticky top-0 z-10 flex h-16 shrink-0 items-center gap-2 border-b px-4 backdrop-blur">
    <SidebarTrigger class="-ml-1" />
    <Separator orientation="vertical" class="mr-2 h-4!" />

    <div class="relative hidden max-w-sm flex-1 md:block">
      <IconSearch class="text-muted-foreground absolute top-1/2 left-3 size-4 -translate-y-1/2" />
      <Input type="search" placeholder="Buscar…" class="bg-card pl-9" />
    </div>

    <div class="ml-auto flex items-center gap-1">
      <ThemeToggle />

      <AppNotifications />

      <DropdownMenu>
        <DropdownMenuTrigger as-child>
          <Button variant="ghost" class="h-11 gap-2 rounded-full px-1.5 lg:pr-3">
            <Avatar class="size-8">
              <AvatarImage v-if="profile.avatar" :src="profile.avatar" :alt="profile.name" />
              <AvatarFallback class="bg-secondary text-secondary-foreground text-xs font-semibold">
                {{ profileInitials }}
              </AvatarFallback>
            </Avatar>
            <span class="hidden text-sm font-medium lg:inline">{{ firstName }}</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" class="w-52">
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
    </div>
  </header>
</template>
