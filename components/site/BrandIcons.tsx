// Marcas exactas del diseño original (front-end/index.html) — se
// preservan tal cual, no se reemplazan por lucide-react (que no tiene
// logos de marca).
//
// WhatsAppIcon/InstagramIcon ya NO se usan directo en el sitio — quedan
// acá solo como FALLBACK de BrandLogo.tsx (se muestran si
// public/images/whatsapp-logo.png / instagram-logo.png todavía no
// existen o fallan al cargar). En cuanto Fernando suba esos 2 archivos,
// BrandLogo pasa a mostrar el logo real solo, esto deja de usarse pero
// se deja como red de seguridad.

export function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M20.5 3.5A11 11 0 0 0 3.2 17L2 22l5.2-1.2A11 11 0 1 0 20.5 3.5zM12 20a9 9 0 0 1-4.6-1.25l-.33-.2-3 .7.7-2.9-.2-.34A9 9 0 1 1 12 20zm5-6.7c-.27-.14-1.6-.8-1.85-.9-.25-.09-.43-.14-.6.14-.18.27-.7.9-.86 1.08-.16.18-.32.2-.6.07-.27-.14-1.13-.42-2.16-1.35a8.1 8.1 0 0 1-1.5-1.87c-.16-.27-.02-.42.12-.55.12-.12.27-.32.4-.48.14-.16.18-.27.27-.45.09-.18.05-.34-.02-.48-.07-.14-.6-1.46-.83-2-.22-.53-.44-.46-.6-.47h-.5c-.18 0-.48.07-.73.34-.25.27-.95.93-.95 2.27s.98 2.63 1.12 2.81c.13.18 1.93 2.95 4.68 4.14.65.28 1.16.45 1.56.58.65.2 1.25.18 1.72.11.52-.08 1.6-.65 1.83-1.28.22-.63.22-1.17.16-1.28-.07-.13-.24-.2-.5-.34z" />
    </svg>
  );
}

export function InstagramIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M12 2.2c-2.7 0-3.05.01-4.12.06-1.06.05-1.79.22-2.43.47a4.9 4.9 0 0 0-1.77 1.15A4.9 4.9 0 0 0 2.53 5.65c-.25.64-.42 1.37-.47 2.43C2 9.15 2 9.5 2 12.2s.01 3.05.06 4.12c.05 1.06.22 1.79.47 2.43a4.9 4.9 0 0 0 1.15 1.77 4.9 4.9 0 0 0 1.77 1.15c.64.25 1.37.42 2.43.47 1.07.05 1.42.06 4.12.06s3.05-.01 4.12-.06c1.06-.05 1.79-.22 2.43-.47a4.9 4.9 0 0 0 1.77-1.15 4.9 4.9 0 0 0 1.15-1.77c.25-.64.42-1.37.47-2.43.05-1.07.06-1.42.06-4.12s-.01-3.05-.06-4.12c-.05-1.06-.22-1.79-.47-2.43a4.9 4.9 0 0 0-1.15-1.77A4.9 4.9 0 0 0 18.98 2.7c-.64-.25-1.37-.42-2.43-.47C15.48 2.18 15.13 2.2 12 2.2zm0 4.8a5 5 0 1 1 0 10 5 5 0 0 1 0-10zm0 1.8a3.2 3.2 0 1 0 0 6.4 3.2 3.2 0 0 0 0-6.4zm5.1-2a1.2 1.2 0 1 1 0 2.4 1.2 1.2 0 0 1 0-2.4z" />
    </svg>
  );
}

export function FacebookIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M22 12a10 10 0 1 0-11.56 9.88v-6.99H7.9V12h2.54V9.8c0-2.5 1.49-3.89 3.78-3.89 1.09 0 2.24.2 2.24.2v2.46h-1.26c-1.24 0-1.63.77-1.63 1.56V12h2.78l-.44 2.89h-2.34v6.99A10 10 0 0 0 22 12z" />
    </svg>
  );
}

export function TikTokIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M16.5 3c.36 2.03 1.5 3.63 3.5 3.98v2.6c-1.2.12-2.32-.2-3.5-.86v6.06c0 4.1-3 6.62-6.6 6.62A6.02 6.02 0 0 1 4 12.94c.32-2.9 2.6-5.06 5.5-5.06.36 0 .7.03 1 .09v2.7a3.1 3.1 0 0 0-1-.17c-1.63 0-2.9 1.28-2.9 2.9a2.9 2.9 0 0 0 5.8.15V3h4.1z" />
    </svg>
  );
}

export function PhoneIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M6.6 10.8a15.1 15.1 0 0 0 6.6 6.6l2.2-2.2a1 1 0 0 1 1-.25 11.3 11.3 0 0 0 3.55.57 1 1 0 0 1 1 1V20a1 1 0 0 1-1 1C10.6 21 3 13.4 3 4a1 1 0 0 1 1-1h3.5a1 1 0 0 1 1 1c0 1.24.2 2.45.57 3.55a1 1 0 0 1-.25 1l-2.22 2.25z" />
    </svg>
  );
}

export function LocationIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M12 2C7.6 2 4 5.6 4 10c0 5.8 7.1 11.3 7.4 11.5a1 1 0 0 0 1.2 0C12.9 21.3 20 15.8 20 10c0-4.4-3.6-8-8-8zm0 10.8A2.8 2.8 0 1 1 12 6.4a2.8 2.8 0 0 1 0 5.6z" />
    </svg>
  );
}
