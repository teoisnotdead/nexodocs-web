# Deuda tecnica

## Entregas al cliente

Estado actual: oculto en la vista de detalle del proceso.

Motivo:

- La funcionalidad esta parcialmente implementada en el flujo interno, pero no esta expuesta en el portal del cliente.
- El usuario interno podia aprobar u observar una entrega, cuando esa decision deberia corresponder al cliente.
- Como el cliente no ve las entregas en su portal, "Observar entrega" no funciona todavia como una conversacion real entre cliente y equipo.

Comportamiento esperado para reactivarla:

- Usuario interno crea una entrega, sube archivos y la marca como enviada.
- Cliente ve entregas enviadas en el portal.
- Cliente descarga archivos y puede aprobar u observar con comentario.
- Usuario interno solo ve el estado, la ultima respuesta del cliente y puede preparar una nueva version cuando haya observaciones.
- Las acciones internas de aprobar/observar deben eliminarse o quedar reservadas para flujos administrativos muy explicitos.

Trabajo pendiente:

- Agregar endpoints de portal para listar entregas visibles por token/sesion.
- Agregar endpoints de portal para descargar items de entrega.
- Agregar endpoint de portal para aprobar u observar una entrega como cliente.
- Registrar la respuesta con actor de cliente, no como usuario interno.
- Ajustar `DeliveriesSection` para mostrar solo acciones internas validas: crear, subir archivos, enviar y ver respuesta.
- Agregar vista de entregas en `/portal/[token]`.
- Revisar estados terminales para bloquear acciones no aplicables sobre entregas aprobadas, completadas o canceladas.
