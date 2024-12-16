import React from "react";
import { TypeAnimation } from "react-type-animation";

function WelcomeMessage(props) {
  return (
    <>
      <div
        className="text-center p-3 bg-secondary text-white link-title"
        style={{
          boxShadow: "0 4px 12px rgba(0, 0, 0, 0.3)",
          borderRadius: "8px",
        }}
      >
        <h1 style={{ whiteSpace: "pre" }}>
          <TypeAnimation
            sequence={[
              "أهلاً ومرحباً بك في برنامج المحامي", // النص الأول
              1000, // مدة الانتظار بعد النص الأول
              "نحن هنا لخدمتك ومساعدتك في كل ما يخص القضايا القانونية", // النص الثاني
              1000, // مدة الانتظار بعد النص الثاني
              "تسهيل إدارة قضاياك ومواعيدك بكل سهولة", // النص الثالث
              1000, // مدة الانتظار بعد النص الثالث
              "توفير الوقت والجهد والوصول إلى المعلومات بسرعة", // النص الرابع
              1000, // مدة الانتظار بعد النص الرابع
              "ابدأ الآن واستمتع بتجربة فريدة", // النص الخامس
              1000, // مدة الانتظار بعد النص الخامس
            ]}
            speed={50}
            repeat={0}
            wrapper="span"
          />
        </h1>
      </div>
    </>
  );
}

export default WelcomeMessage;
