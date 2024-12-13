import React, { useState, useEffect } from "react";
import axios from "axios";
import Swal from "sweetalert2";

const AddCustomer = () => {
  const [clientData, setClientData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    customer_category_id: "",
    ID_number: "",
    nationality: "", // القيمة الافتراضية تم إزالتها، الحقل فارغ الآن
    company_name: "",
    notes: "",
  });

  const [categories, setCategories] = useState([]);

  useEffect(() => {
    const fetchCategories = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        Swal.fire({
          title: "غير مصرح",
          text: "يرجى تسجيل الدخول أولاً.",
          icon: "warning",
          confirmButtonText: "حسنًا",
        });
        return;
      }

      try {
        const response = await axios.get(
          "https://law-office.al-mosa.com/api/categories",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        setCategories(response.data);
      } catch (error) {
        console.error("خطأ في تحميل الفئات: ", error);
        Swal.fire({
          title: "فشل في تحميل فئات العملاء",
          text: "حدث خطأ أثناء تحميل فئات العملاء، يرجى المحاولة مرة أخرى.",
          icon: "error",
          confirmButtonText: "حسنًا",
        });
      }
    };

    fetchCategories();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setClientData({
      ...clientData,
      [name]: value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");

    if (!token) {
      Swal.fire({
        title: "غير مصرح",
        text: "يرجى تسجيل الدخول أولاً للوصول إلى هذه الصفحة.",
        icon: "warning",
        confirmButtonText: "حسنًا",
      });
      return;
    }

    if (
      clientData.name &&
      clientData.email &&
      clientData.phone &&
      clientData.customer_category_id &&
      clientData.ID_number
    ) {
      try {
        const response = await axios.post(
          "https://law-office.al-mosa.com/api/store-customer",
          clientData,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        console.log(response);
        Swal.fire({
          title: "تم إضافة العميل بنجاح",
          text: `تم إضافة العميل ${clientData.name} بنجاح.`,
          icon: "success",
          confirmButtonText: "حسنًا",
        });
        setClientData({
          name: "",
          email: "",
          phone: "",
          address: "",
          customer_category_id: "",
          ID_number: "",
          nationality: "", // تم إزالة القيمة الافتراضية من هنا أيضاً
          company_name: "",
          notes: "",
        });
      } catch (error) {
        console.error("خطأ في إرسال البيانات: ", error);
        Swal.fire({
          title: "فشل في إضافة العميل",
          text:
            error.response?.data?.message ||
            "حدث خطأ أثناء إضافة العميل، يرجى المحاولة مرة أخرى.",
          icon: "error",
          confirmButtonText: "حسنًا",
        });
      }
    } else {
      Swal.fire({
        title: "خطأ في البيانات",
        text: "يرجى التأكد من ملء جميع الحقول الأساسية (الاسم، البريد الإلكتروني، رقم الهاتف، وفئة العميل ورقم الهوية).",
        icon: "error",
        confirmButtonText: "حسنًا",
      });
    }
  };

  return (
    <div className="container my-4">
      <h2 className="text-center py-4 fs-2 fw-bold">إضافة عميل جديد</h2>
      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <label
            htmlFor="name"
            className="form-label text-end w-100 fs-3 fw-bold"
          >
            الاسم الكامل
          </label>
          <input
            type="text"
            className="form-control text-end w-100"
            id="name"
            name="name"
            value={clientData.name}
            onChange={handleChange}
          />
        </div>
        <div className="mb-3">
          <label
            htmlFor="email"
            className="form-label text-end w-100 fs-3 fw-bold"
          >
            البريد الإلكتروني
          </label>
          <input
            type="email"
            className="form-control text-end w-100"
            id="email"
            name="email"
            value={clientData.email}
            onChange={handleChange}
          />
        </div>
        <div className="mb-3">
          <label
            htmlFor="phone"
            className="form-label text-end w-100 fs-3 fw-bold"
          >
            رقم الهاتف
          </label>
          <input
            type="text"
            className="form-control text-end w-100"
            id="phone"
            name="phone"
            value={clientData.phone}
            onChange={handleChange}
          />
        </div>
        <div className="mb-3">
          <label
            htmlFor="address"
            className="form-label text-end w-100 fs-3 fw-bold"
          >
            العنوان
          </label>
          <input
            type="text"
            className="form-control text-end w-100"
            id="address"
            name="address"
            value={clientData.address}
            onChange={handleChange}
          />
        </div>
        <div className="mb-3">
          <label
            htmlFor="customer_category_id"
            className="form-label text-end w-100 fs-3 fw-bold"
          >
            فئة العميل
          </label>
          <select
            className="form-select text-end w-100"
            id="customer_category_id"
            name="customer_category_id"
            value={clientData.customer_category_id}
            onChange={handleChange}
          >
            <option value="">اختر فئة العميل</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </div>
        <div className="mb-3">
          <label
            htmlFor="ID_number"
            className="form-label text-end w-100 fs-3 fw-bold"
          >
            رقم الهوية
          </label>
          <input
            type="text"
            className="form-control text-end w-100"
            id="ID_number"
            name="ID_number"
            value={clientData.ID_number}
            onChange={handleChange}
          />
        </div>
        <div className="mb-3">
          <label
            htmlFor="nationality"
            className="form-label text-end w-100 fs-3 fw-bold"
          >
            الجنسية
          </label>
          <input
            type="text"
            className="form-control text-end w-100"
            id="nationality"
            name="nationality"
            value={clientData.nationality}
            onChange={handleChange}
          />
        </div>
        <div className="mb-3">
          <label
            htmlFor="company_name"
            className="form-label text-end w-100 fs-3 fw-bold"
          >
            اسم الشركة
          </label>
          <input
            type="text"
            className="form-control text-end w-100"
            id="company_name"
            name="company_name"
            value={clientData.company_name}
            onChange={handleChange}
          />
        </div>
        <div className="mb-3">
          <label
            htmlFor="notes"
            className="form-label text-end w-100 fs-3 fw-bold"
          >
            الملاحظات
          </label>
          <textarea
            className="form-control text-end w-100"
            id="notes"
            name="notes"
            value={clientData.notes}
            onChange={handleChange}
          />
        </div>
        <div className="text-end">
          <button type="submit" className="btn btn-dark text-white">
            <i className="fa fa-user-plus me-2"></i> إضافة العميل
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddCustomer;
