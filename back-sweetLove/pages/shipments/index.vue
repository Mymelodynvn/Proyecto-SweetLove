<!--
  Página de envíos del administrador.
  Consume la relación envio → estadoenvio mediante la API /api/shipments.
-->
<script setup lang="ts">
import { Card, CardContent } from '~/components/ui/card'
import { Badge } from '~/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '~/components/ui/table'
useHead({ title: 'Envíos | Sweet Love Admin' })
const { data, pending } = await useFetch<Array<{ id:number; paymentId:number; statusId:number; status:string }>>('/api/shipments', { default: () => [] })
const statusClass = (status: string) => status === 'Entregado' ? 'bg-primary/15 text-primary border-transparent' : status === 'En camino' ? 'bg-secondary text-secondary-foreground border-transparent' : 'bg-chart-5/40 text-foreground border-transparent'
</script>
<template>
  <div class="flex flex-col gap-6"><div><h1 class="font-heading text-2xl font-bold">Envíos</h1><p class="text-muted-foreground">Consulta el estado logístico de cada pedido.</p></div>
  <Card><CardContent><p v-if="pending" class="py-8 text-center">Cargando envíos…</p><Table v-else><TableHeader><TableRow><TableHead>Envío</TableHead><TableHead>Pago asociado</TableHead><TableHead>Estado</TableHead></TableRow></TableHeader><TableBody><TableRow v-for="item in data" :key="item.id"><TableCell>#{{ item.id }}</TableCell><TableCell>#{{ item.paymentId }}</TableCell><TableCell><Badge :class="statusClass(item.status)">{{ item.status }}</Badge></TableCell></TableRow><TableRow v-if="!data.length"><TableCell colspan="3" class="py-8 text-center">No hay envíos registrados.</TableCell></TableRow></TableBody></Table></CardContent></Card></div>
</template>
