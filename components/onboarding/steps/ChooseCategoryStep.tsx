"use client";

import { useState } from "react";

interface ChooseCategoryStepProps {
  onNext: () => void;
  onBack: () => void;
  onSelectCategory: (category: "studio" | "creator") => void;
}

type CategoryType = "studio" | "creator" | null;

export default function ChooseCategoryStep({ onNext, onBack, onSelectCategory }: ChooseCategoryStepProps) {
  const [selectedCategory, setSelectedCategory] = useState<CategoryType>(null);

  const handleProceed = () => {
    if (selectedCategory) {
      onSelectCategory(selectedCategory);
      onNext();
    }
  };

  return (
    <div className="choose-category-step">
      <h1 className="title">Choose Category</h1>

      <div className="category-options">
        <label
          className={`category-option ${selectedCategory === "studio" ? "selected" : ""}`}
        >
          <input
            type="radio"
            name="category"
            value="studio"
            checked={selectedCategory === "studio"}
            onChange={() => setSelectedCategory("studio")}
          />
          <span className="option-text">Signup as a Studio / Brand</span>
          <span className="radio-indicator" />
        </label>

        <label
          className={`category-option ${selectedCategory === "creator" ? "selected" : ""}`}
        >
          <input
            type="radio"
            name="category"
            value="creator"
            checked={selectedCategory === "creator"}
            onChange={() => setSelectedCategory("creator")}
          />
          <span className="option-text">Signup as a Creator</span>
          <span className="radio-indicator" />
        </label>
      </div>

      <button
        className={`proceed-button ${selectedCategory ? "active" : ""}`}
        onClick={handleProceed}
        disabled={!selectedCategory}
      >
        Proceed
      </button>

      <style jsx>{`
        .choose-category-step {
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          width: 100%;
          max-width: 380px;
        }

        .title {
          font-family: var(--font-preahvihear), serif;
          font-weight: 400;
          font-size: 42px;
          line-height: 1.2;
          color: #ffffff;
          margin-bottom: 40px;
          letter-spacing: -0.5px;
        }

        .category-options {
          display: flex;
          flex-direction: column;
          gap: 16px;
          width: 100%;
          margin-bottom: 32px;
        }

        .category-option {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 20px 24px;
          background: transparent;
          border: 1px solid var(--input-border);
          border-radius: 12px;
          cursor: pointer;
          transition: all 0.3s ease;
          position: relative;
        }

        .category-option:hover {
          border-color: rgba(255, 255, 255, 0.4);
        }

        .category-option.selected {
          border-color: var(--primary);
          background: rgba(118, 40, 219, 0.1);
        }

        .category-option input {
          position: absolute;
          opacity: 0;
          cursor: pointer;
        }

        .option-text {
          font-family: var(--font-dm-sans), sans-serif;
          font-size: 16px;
          font-weight: 400;
          color: rgba(255, 255, 255, 0.7);
        }

        .category-option.selected .option-text {
          color: #ffffff;
        }

        .radio-indicator {
          width: 20px;
          height: 20px;
          border: 2px solid var(--input-border);
          border-radius: 50%;
          position: relative;
          transition: all 0.3s ease;
        }

        .category-option.selected .radio-indicator {
          border-color: var(--primary);
        }

        .category-option.selected .radio-indicator::after {
          content: "";
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 10px;
          height: 10px;
          background: var(--primary);
          border-radius: 50%;
        }

        .proceed-button {
          padding: 16px 48px;
          background: rgba(118, 40, 219, 0.5);
          border: none;
          border-radius: 30px;
          color: rgba(255, 255, 255, 0.5);
          font-family: var(--font-dm-sans), sans-serif;
          font-size: 16px;
          font-weight: 600;
          cursor: not-allowed;
          transition: all 0.3s ease;
        }

        .proceed-button.active {
          background: linear-gradient(135deg, #7628db 0%, #9b4dff 100%);
          color: #ffffff;
          cursor: pointer;
          box-shadow: 0 4px 20px rgba(118, 40, 219, 0.4);
        }

        .proceed-button.active:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 25px rgba(118, 40, 219, 0.5);
        }

        @media (max-width: 768px) {
          .choose-category-step {
            align-items: center;
            text-align: center;
          }

          .title {
            font-size: 32px;
            margin-bottom: 32px;
          }

          .category-option {
            padding: 16px 20px;
          }

          .option-text {
            font-size: 14px;
          }
        }
      `}</style>
    </div>
  );
}
