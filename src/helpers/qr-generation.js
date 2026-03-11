import QRCode from 'qrcode';

const url = "https://theuselessweb.com/"
const API_BASE = "http://localhost:3001/api";

export const generateQRCode = async () => {
    return 0;
}

export const generateTestQRCode = async () => {
    const qrCodeDataURL = await QRCode.toDataURL(url);
    return qrCodeDataURL;
}