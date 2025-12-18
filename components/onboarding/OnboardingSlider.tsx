"use client";

import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";
import Image from "next/image";

interface OnboardingSliderProps {
  currentStep: number;
}

const sliderSlides = [
  {
    image: "/images/onboarding/sideimageman.jpg",
    alt: "Onboarding Image",
  },
  {
    image: "/images/onboarding/sideimageman.jpg",
    alt: "Onboarding Image",
  },
  {
    image: "/images/onboarding/sideimageman.jpg",
    alt: "Onboarding Image",
  }
];

export default function OnboardingSlider({ currentStep }: OnboardingSliderProps) {
  return (
      <div className="w-full h-full flex flex-col gap-6">
        <div className="flex-1 relative rounded-[24px] overflow-hidden w-full min-h-0">
          <Swiper
            modules={[Autoplay, Pagination]}
            spaceBetween={0}
            slidesPerView={1}
            autoplay={{
              delay: 5000,
              disableOnInteraction: false,
            }}
            pagination={{
              clickable: true,
              el: ".custom-pagination",
              bulletClass: "inline-block w-10 h-1 bg-white/30 rounded-[2px] mx-1 cursor-pointer transition-all duration-300",
              bulletActiveClass: "!bg-[#7628db] !w-[50px]",
            }}
            loop={true}
            className="w-full h-full"
          >
            {sliderSlides.map((slide, index) => (
              <SwiperSlide key={index}>
                <div className="w-full h-full relative">
                  <Image 
                    src={slide.image} 
                    alt={slide.alt}
                    fill
                    className="object-cover"
                    priority={index === 0}
                  />
                  <div className="absolute inset-0 bg-linear-to-b from-transparent to-black/40" />
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
        </div>

        <div className="custom-pagination flex justify-center items-center h-[10px]" />
      </div>
  );
}
