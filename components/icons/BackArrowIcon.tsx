export default function BackArrowIcon({ className = "" }: { className?: string }) {
  return (
    <svg
      width="43"
      height="23"
      viewBox="0 0 43 23"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <path
        d="M1.5 11.5H41.5M1.5 11.5L11.5 1.5M1.5 11.5L11.5 21.5"
        stroke="white"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
