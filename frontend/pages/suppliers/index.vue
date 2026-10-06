<!-- Página de proveedores del administrador -->
<script setup lang="ts">
import { Card, CardContent } from '~/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '~/components/ui/table'
useHead({ title: 'Proveedores | Sweet Love Admin' })
const { data, pending } = await useFetch<Array<{ id:number; name:string; email:string; phone:string; userId:number|null }>>('/api/suppliers', { default: () => [] })
</script>
<template>
  <div class="flex flex-col gap-6"><div><h1 class="font-heading text-2xl font-bold">Proveedores</h1><p class="text-muted-foreground">Proveedores registrados en la base de datos de Sweet Love.</p></div>
  <Card><CardContent><p v-if="pending" class="py-8 text-center">Cargando proveedores…</p><Table v-else><TableHeader><TableRow><TableHead>Proveedor</TableHead><TableHead>Correo</TableHead><TableHead>Teléfono</TableHead><TableHead>Usuario asociado</TableHead></TableRow></TableHeader><TableBody><TableRow v-for="item in data" :key="item.id"><TableCell class="font-medium">{{ item.name }}</TableCell><TableCell>{{ item.email || 'No registrado' }}</TableCell><TableCell>{{ item.phone }}</TableCell><TableCell>{{ item.userId ?? 'Sin usuario' }}</TableCell></TableRow><TableRow v-if="!data.length"><TableCell colspan="4" class="py-8 text-center">No hay proveedores registrados.</TableCell></TableRow></TableBody></Table></CardContent></Card></div>
</template>
