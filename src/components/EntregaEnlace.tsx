interface EntregaEnlaceProps {
  showToast: (msg: string) => void;
}

export default function EntregaEnlace({ showToast }: EntregaEnlaceProps) {
  return (
    <div>
      <h2>Entregar enlace</h2>

      <input type="text" placeholder="https://..." />

      <button>Entregar</button>
    </div>
  );
}