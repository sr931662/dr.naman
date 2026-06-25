export default function Cursor() {
  return (
    <>
      <div className="cursor-ring">
        <svg viewBox="0 0 36 36">
          <circle cx="18" cy="18" r="15.5"/>
          <path className="med" d="M18 9.5 V26.5 M9.5 18 H26.5"/>
        </svg>
      </div>
      <div className="cursor-dot"></div>
    </>
  )
}
