<!--
  Página de pagos del administrador.
  Consume la tabla pago mediante la API /api/payments.
-->
<script setup lang="ts">
import { Card, CardContent } from '~/components/ui/card'
import { Badge } from '~/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '~/components/ui/table'
useHead({ title: 'Pagos | Sweet Love Admin' })
const { data, pending } = await useFetch<Array<{ id:number; provider:string; amount:number; status:string; orderId:number }>>('/api/payments', { default: () => [] })
const statusClass = (status: string) => status === 'Aprobado' ? 'bg-primary/15 text-primary border-transparent' : status === 'Pendiente' ? 'bg-chart-5/40 text-foreground border-transparent' : 'bg-destructive/10 text-destructive border-transparent'
</script>
<template>
  <div class="flex flex-col gap-6"><div><h1 class="font-heading text-2xl font-bold">Pagos</h1><p class="text-muted-foreground">Consulta los pagos registrados y su pedido asociado.</p></div>
  <Card><CardContent><p v-if="pending" class="py-8 text-center">Cargando pagos…</p><Table v-else><TableHeader><TableRow><TableHead>Pago</TableHead><TableHead>Pedido</TableHead><TableHead>Medio</TableHead><TableHead>Monto</TableHead><TableHead>Estado</TableHead></TableRow></TableHeader><TableBody><TableRow v-for="item in data" :key="item.id"><TableCell>#{{ item.id }}</TableCell><TableCell>#SL{{ String(item.orderId).padStart(4, '0') }}</TableCell><TableCell>{{ item.provider }}</TableCell><TableCell>{{ formatCop(item.amount) }}</TableCell><TableCell><Badge :class="statusClass(item.status)">{{ item.status }}</Badge></TableCell></TableRow><TableRow v-if="!data.length"><TableCell colspan="5" class="py-8 text-center">No hay pagos registrados.</TableCell></TableRow></TableBody></Table></CardContent></Card></div>
</template>
