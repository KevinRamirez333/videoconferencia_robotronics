const configuracionIce: RTCConfiguration = {
  iceServers: [{ urls: 'stun:stun.l.google.com:19302' }],
}

export function crearConexionPar(): RTCPeerConnection {
  return new RTCPeerConnection(configuracionIce)
}
