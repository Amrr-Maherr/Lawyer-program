import React, { useState } from "react";
import Swal from "sweetalert2";

const SystemSettings = () => {
  // القيم الافتراضية للإعدادات
  const defaultSettings = {
    color: "primary", // تحديد لون من ألوان Bootstrap
    fontSize: "fs-3", // تحديد حجم خط من فئات Bootstrap
  };

  // استرجاع الإعدادات من localStorage أو استخدام القيم الافتراضية
  const [color, setColor] = useState(
    localStorage.getItem("color") || defaultSettings.color
  );
  const [fontSize, setFontSize] = useState(
    localStorage.getItem("fontSize") || defaultSettings.fontSize
  );

  // تحديث اللون
  const onColorChange = (e) => {
    setColor(e.target.value);
  };

  // تحديث حجم الخط
  const onFontSizeChange = (e) => {
    setFontSize(e.target.value);
  };

  // حفظ الإعدادات في localStorage
  const saveSettings = () => {
    // استخدام sweetalert للتأكيد
    Swal.fire({
      title: "هل أنت متأكد؟",
      text: "سيتم حفظ الإعدادات الجديدة.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "نعم",
      cancelButtonText: "لا",
    }).then((result) => {
      if (result.isConfirmed) {
        localStorage.setItem("color", color);
        localStorage.setItem("fontSize", fontSize);
        Swal.fire("تم الحفظ!", "تم حفظ الإعدادات بنجاح.", "success");
      }
    });
  };

  return (
    <div className="container mb-4" dir="rtl">
      <h2 className="text-center mb-4">إعدادات العرض</h2>

      <div className="form-group mb-3">
        <label htmlFor="colorPicker" className="form-label">
          اختار اللون
        </label>
        <select
          id="colorPicker"
          value={color}
          onChange={onColorChange}
          className="form-select"
        >
          <option value="primary">أساسي</option>
          <option value="secondary">ثانوي</option>
          <option value="success">نجاح</option>
          <option value="danger">خطر</option>
          <option value="warning">تحذير</option>
          <option value="info">معلومات</option>
          <option value="light">فاتح</option>
          <option value="dark">داكن</option>
        </select>
      </div>

      <div className="form-group mb-3">
        <label htmlFor="fontSize" className="form-label">
          حجم الخط
        </label>
        <select
          id="fontSize"
          value={fontSize}
          onChange={onFontSizeChange}
          className="form-select"
        >
          <option value="fs-1">كبيرة جدًا</option>
          <option value="fs-2">كبيرة</option>
          <option value="fs-3">متوسطة</option>
          <option value="fs-4">صغيرة</option>
          <option value="fs-5">صغيرة جدًا</option>
        </select>
      </div>

      <button className="btn btn-dark mt-3" onClick={saveSettings}>
        حفظ الإعدادات
      </button>

      {/* نص لاختبار الإعدادات */}
      <div className="my-5 text-center">
        <h2 className={`${fontSize} text-${color}`}>اختبار الإعدادات</h2>
        <p className={`${fontSize} text-${color}`}>
          هذا النص يستخدم الإعدادات التي تم اختيارها. ستلاحظ التغييرات في اللون
          وحجم الخط عند تعديل الإعدادات وحفظها.
        </p>
      </div>
    </div>
  );
};

export default SystemSettings;
