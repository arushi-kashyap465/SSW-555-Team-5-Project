import QRCode from 'qrcode';

const url = "https://theuselessweb.com/"

export const generateQRCode = async () => {
    return 0;
}

export const generateTestQRCode = async () => {
    const qrCodeDataURL = await QRCode.toDataURL(url);
    return qrCodeDataURL;
}