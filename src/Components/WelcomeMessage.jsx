import React from "react";
import { TypeAnimation } from "react-type-animation";

function WelcomeMessage(props) {
  return (
    <>
      <div
        className="text-center p-3"
        style={{
          backgroundColor: "#1a237e", // أزرق كحلي داكن للخلفية
          color: "#fff", // أبيض للنص
          boxShadow: "0 4px 12px rgba(0, 0, 0, 0.2)",
          borderRadius: "8px",
        }}
      >
        <h1 style={{ whiteSpace: "pre" }}>
          <TypeAnimation
            sequence={[
              "أهلاً ومرحباً بك في برنامج المحامي", // النص الأول
              1000,
              "نحن هنا لخدمتك ومساعدتك في كل ما يخص القضايا القانونية", // النص الثاني
              1000,
              "تسهيل إدارة قضاياك ومواعيدك بكل سهولة", // النص الثالث
              1000,
              "توفير الوقت والجهد والوصول إلى المعلومات بسرعة", // النص الرابع
              1000,
              "ابدأ الآن واستمتع بتجربة فريدة", // النص الخامس
              1000,
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
