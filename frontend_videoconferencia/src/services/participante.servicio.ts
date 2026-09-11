import api from './api'

export interface Participante {
  _id: string
  sesionId: string
  usuarioId: string
  seUnioEn: string
  salioEn?: string
}

export const participanteServicio = {
  listarParticipantes: async (): Promise<Participante[]> => {
    const respuesta = await api.get<Participante[]>('/participantes')
    return respuesta.data
  },
}
