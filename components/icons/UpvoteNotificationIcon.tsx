import React from "react";

export default function UpvoteNotificationIcon({ className }: { className?: string }) {
  return (
    <svg 
      width="15" 
      height="15" 
      viewBox="0 0 15 15" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <path d="M6.37033 0.549085C6.74019 -0.183035 7.78562 -0.183034 8.15547 0.549087L14.4165 12.9427C14.7525 13.6079 14.2691 14.3937 13.5239 14.3937H1.00185C0.25666 14.3937 -0.226731 13.6079 0.109282 12.9427L6.37033 0.549085Z" fill="url(#paint0_linear_244_555)"/>
      <defs>
        <linearGradient id="paint0_linear_244_555" x1="16.3696" y1="9.18986" x2="-1.84375" y2="9.18986" gradientUnits="userSpaceOnUse">
          <stop stopColor="#A86CF5"/>
          <stop offset="1" stopColor="#40A261"/>
        </linearGradient>
      </defs>
    </svg>
  );
}
