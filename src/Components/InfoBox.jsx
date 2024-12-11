import React, { useState } from "react";

function InfoBox(props) {
  const [scale, setScale] = useState(1); // حالة للتحكم في مقياس العنصر
  const [shadow, setShadow] = useState("0 4px 8px rgba(0, 0, 0, 0.2)"); // حالة للظل

  return (
    <div
      className="card hover card-info"
      style={{
        boxShadow: shadow, // الظل حول البطاقة
        transition: "transform 0.3s, box-shadow 0.3s", // تأثير التحول السلس
        transform: `scale(${scale})`, // تطبيق مقياس العنصر
      }}
      onMouseOver={() => {
        setScale(1.05); // تكبير العنصر عند التمرير عليه
        setShadow("0 8px 16px rgba(0, 0, 0, 0.3)"); // زيادة الظل
      }}
      onMouseOut={() => {
        setScale(1); // إعادة المقياس إلى الحجم الأصلي
        setShadow("0 4px 8px rgba(0, 0, 0, 0.2)"); // إعادة الظل إلى الوضع الطبيعي
      }}
    >
      <div className="card-body d-flex flex-column align-items-center justify-content-center gap-2">
        <h5 className="card-title">{props.title}</h5> {/* الاسم في المنتصف */}
        {/* الأيقونة والنص جنب بعض */}
        <div className="d-flex align-items-center gap-2">
          <i className={props.icon}></i> {/* الأيقونة */}
          <p className="card-text mb-0">{props.value}</p>{" "}
          {/* النص بجانب الأيقونة */}
        </div>
      </div>
    </div>
  );
}

export default InfoBox;
