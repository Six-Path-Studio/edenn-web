"use client";

interface StepProgressProps {
  currentStep: number;
  totalSteps: number;
}

export default function StepProgress({ currentStep, totalSteps }: StepProgressProps) {
  return (
    <div className="step-progress">
      {Array.from({ length: totalSteps }, (_, index) => {
        const stepNumber = index + 1;
        const isCompleted = stepNumber < currentStep;
        const isActive = stepNumber === currentStep;
        const isFuture = stepNumber > currentStep;

        return (
          <div
            key={index}
            className={`step-indicator ${
              isCompleted ? "completed" : ""
            } ${isActive ? "active" : ""} ${isFuture ? "future" : ""}`}
          />
        );
      })}

      <style jsx>{`
        .step-progress {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-top: 32px;
        }

        .step-indicator {
          height: 4px;
          border-radius: 2px;
          transition: all 0.3s ease;
        }

        .step-indicator.completed {
          width: 20px;
          background: #7628db;
        }

        .step-indicator.active {
          width: 50px;
          background: linear-gradient(90deg, #7628db 0%, #9b4dff 100%);
        }

        .step-indicator.future {
          width: 20px;
          background: rgba(255, 255, 255, 0.2);
        }

        @media (max-width: 768px) {
          .step-progress {
            justify-content: center;
            margin-top: 24px;
          }
        }
      `}</style>
    </div>
  );
}
