import fs from 'fs';
import path from 'path';
import selfsigned from 'selfsigned';

const CARPETA_CERTIFICADOS = path.resolve(__dirname, '../../certs');
const RUTA_CLAVE = path.join(CARPETA_CERTIFICADOS, 'clave.pem');
const RUTA_CERTIFICADO = path.join(CARPETA_CERTIFICADOS, 'certificado.pem');

export interface ICertificadoDesarrollo {
    key: string;
    cert: string;
}

export async function obtenerCertificadoDesarrollo(): Promise<ICertificadoDesarrollo> {
    if (fs.existsSync(RUTA_CLAVE) && fs.existsSync(RUTA_CERTIFICADO)) {
        return {
            key: fs.readFileSync(RUTA_CLAVE, 'utf-8'),
            cert: fs.readFileSync(RUTA_CERTIFICADO, 'utf-8'),
        };
    }

    const atributos = [{ name: 'commonName', value: 'videoconferencia-robotronics.local' }];
    const generado = await selfsigned.generate(atributos, {
        notAfterDate: new Date(Date.now() + 825 * 24 * 60 * 60 * 1000),
        keySize: 2048,
        extensions: [{ name: 'basicConstraints', cA: true }],
    });

    fs.mkdirSync(CARPETA_CERTIFICADOS, { recursive: true });
    fs.writeFileSync(RUTA_CLAVE, generado.private);
    fs.writeFileSync(RUTA_CERTIFICADO, generado.cert);

    return { key: generado.private, cert: generado.cert };
}
