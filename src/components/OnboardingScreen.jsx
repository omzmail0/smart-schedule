import React, { useState } from 'react';
import { Calendar, CheckCircle2, ThumbsUp, ArrowLeft, ArrowRight } from 'lucide-react';
import Button from './Button';

const OnboardingScreen = ({ onFinish, settings, user }) => {
  const [step, setStep] = useState(0);

  const steps = [
    {
      icon: <Calendar size={48} className="text-blue-500"/>,
      title: `أهلاً بك يا ${user.name.split(' ')[0]} 👋`,
      desc: "ده نظام بسيط هيساعدنا نختار أنسب ميعاد للاجتماع، بناءً على وقت فراغك ووقت فراغ الفريق كله."
    },
    {
      icon: <CheckCircle2 size={48} className="text-green-500"/>,
      title: "المطلوب منك بسيط",
      desc: "هتظهرلك قائمة بالمواعيد المتاحة. كل اللي عليك تعلم على كل الساعات اللي أنت فاضي فيها."
    },
    {
      icon: <ThumbsUp size={48} className="text-purple-500"/>,
      title: "كل ما تختار أكتر، أحسن",
      desc: "ماتخترش ميعاد واحد بس! اختار كل الأوقات المناسبة ليك عشان فرصتنا نلاقي ميعاد يجمعنا كلنا تزيد."
    }
  ];

  const handleNext = () => {
    if (step < steps.length - 1) {
      setStep(step + 1);
    } else {
      onFinish();
    }
  };

  const handleBack = () => {
      if (step > 0) setStep(step - 1);
  };

  return (
    <div className="fixed inset-0 bg-white z-50 flex flex-col items-center justify-center p-6 text-center animate-in fade-in">
      
      <div className="w-full max-w-sm">
        {/* Progress Bar */}
        <div className="flex gap-2 mb-10 justify-center">
            {steps.map((_, i) => (
                <div key={i} className={`h-1.5 rounded-full transition-all duration-300 ${i === step ? 'w-8 bg-gray-800' : 'w-2 bg-gray-200'}`}></div>
            ))}
        </div>

        {/* Content */}
        <div className="mb-10 min-h-[250px] flex flex-col items-center justify-center animate-in slide-in-from-bottom-4 duration-500" key={step}>
            <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mb-6 shadow-sm border border-gray-100">
                {steps[step].icon}
            </div>
            <h2 className="text-2xl font-black text-gray-900 mb-3">{steps[step].title}</h2>
            <p className="text-gray-500 font-medium leading-relaxed max-w-xs mx-auto">
                {steps[step].desc}
            </p>
        </div>

        {/* Buttons */}
        <div className="flex gap-3">
            {step > 0 && (
                <button onClick={handleBack} className="w-14 h-16 rounded-2xl bg-gray-100 text-gray-500 flex items-center justify-center hover:bg-gray-200 transition-colors">
                    <ArrowRight size={24}/>
                </button>
            )}
            <Button 
                onClick={handleNext} 
                style={{ backgroundColor: settings.primaryColor }} 
                className="flex-1 h-16 text-lg text-white rounded-2xl shadow-xl hover:scale-[1.02] transition-transform"
            >
                {step === steps.length - 1 ? 'فهمت، يلا نبدأ' : 'التالي'} <ArrowLeft size={20} className="mr-2"/>
            </Button>
        </div>
      </div>

    </div>
  );
};

export default OnboardingScreen;
