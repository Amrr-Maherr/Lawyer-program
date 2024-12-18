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
    nationality: "",
    company_name: "",
    notes: "",
  });
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchCategories = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        Swal.fire({
          title: "غير مصرح",
          text: "يرجى تسجيل الدخول أولاً.",
          icon: "warning",
          confirmButtonText: "حسنًا",
          rtl: true, // إضافة rtl
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
          rtl: true, // إضافة rtl
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
        rtl: true,
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
        setLoading(true); // تعيين حالة التحميل إلى true
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
          confirmButtonText: "موافق",
          rtl: true,
        });
        setClientData({
          name: "",
          email: "",
          phone: "",
          address: "",
          customer_category_id: "",
          ID_number: "",
          nationality: "",
          company_name: "",
          notes: "",
        });
      } catch (error) {
        console.error("خطأ في إرسال البيانات: ", error);
        if (
          error.response &&
          error.response.data &&
          error.response.data.errors
        ) {
          const errors = error.response.data.errors;
          let errorMessages = [];
          for (const key in errors) {
            errorMessages = errorMessages.concat(errors[key]);
          }
          const translatedErrorMessages = errorMessages.map((msg) => {
            switch (msg) {
              case "The name field is required.":
                return "حقل الاسم مطلوب.";
              case "The email field is required.":
                return "حقل البريد الإلكتروني مطلوب.";
              case "The phone field is required.":
                return "حقل الهاتف مطلوب.";
              case "The category field is required.":
                return "حقل فئة العميل مطلوب.";
              case "The ID number field is required.":
                return "حقل رقم الهوية مطلوب";
              default:
                return msg;
            }
          });

          Swal.fire({
            title: "خطأ في الإدخال",
            html: translatedErrorMessages
              .map((msg) => `<p style="text-align: right;">${msg}</p>`)
              .join(""),
            icon: "error",
            confirmButtonText: "موافق",
            rtl: true,
          });
        } else {
          Swal.fire({
            title: "فشل في إضافة العميل",
            text:
              error.response?.data?.message ||
              "حدث خطأ أثناء إضافة العميل، يرجى المحاولة مرة أخرى.",
            icon: "error",
            confirmButtonText: "موافق",
            rtl: true,
          });
        }
      } finally {
        setLoading(false); // تعيين حالة التحميل إلى false بعد الانتهاء
      }
    } else {
      Swal.fire({
        title: "خطأ في البيانات",
        text: "يرجى التأكد من ملء جميع الحقول الأساسية (الاسم، البريد الإلكتروني، رقم الهاتف، وفئة العميل ورقم الهوية).",
        icon: "error",
        confirmButtonText: "موافق",
        rtl: true,
      });
    }
  };

  return (
    <div className="container mt-5" dir="rtl">
      <h1 className="text-center mb-4">إضافة عميل جديد</h1>
      <form onSubmit={handleSubmit}>
        <div className="row mb-3">
          <div className="col-md-6 mb-3">
            <label className="form-label fs-5 fw-bold">الاسم الكامل</label>
            <input
              type="text"
              className="form-control form-control-lg rounded-3 border-dark shadow-sm"
              name="name"
              value={clientData.name}
              onChange={handleChange}
              disabled={loading}
            />
          </div>
          <div className="col-md-6 mb-3">
            <label className="form-label fs-5 fw-bold">البريد الإلكتروني</label>
            <input
              type="email"
              className="form-control form-control-lg rounded-3 border-dark shadow-sm"
              name="email"
              value={clientData.email}
              onChange={handleChange}
              disabled={loading}
            />
          </div>
        </div>
        <div className="row mb-3">
          <div className="col-md-6 mb-3">
            <label className="form-label fs-5 fw-bold">رقم الهاتف</label>
            <input
              type="text"
              className="form-control form-control-lg rounded-3 border-dark shadow-sm"
              name="phone"
              value={clientData.phone}
              onChange={handleChange}
              disabled={loading}
            />
          </div>
          <div className="col-md-6 mb-3">
            <label className="form-label fs-5 fw-bold">العنوان</label>
            <input
              type="text"
              className="form-control form-control-lg rounded-3 border-dark shadow-sm"
              name="address"
              value={clientData.address}
              onChange={handleChange}
              disabled={loading}
            />
          </div>
        </div>
        <div className="row mb-3">
          <div className="col-md-6 mb-3">
            <label className="form-label fs-5 fw-bold">فئة العميل</label>
            <select
              className="form-select form-control-lg rounded-3 border-dark shadow-sm"
              name="customer_category_id"
              value={clientData.customer_category_id}
              onChange={handleChange}
              disabled={loading}
            >
              <option value="">اختر فئة العميل</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>
          <div className="col-md-6 mb-3">
            <label className="form-label fs-5 fw-bold">رقم الهوية</label>
            <input
              type="text"
              className="form-control form-control-lg rounded-3 border-dark shadow-sm"
              name="ID_number"
              value={clientData.ID_number}
              onChange={handleChange}
              disabled={loading}
            />
          </div>
        </div>
        <div className="row mb-3">
          <div className="col-md-6 mb-3">
            <label className="form-label fs-5 fw-bold">الجنسية</label>
            <input
              type="text"
              className="form-control form-control-lg rounded-3 border-dark shadow-sm"
              name="nationality"
              value={clientData.nationality}
              onChange={handleChange}
              disabled={loading}
            />
          </div>
          <div className="col-md-6 mb-3">
            <label className="form-label fs-5 fw-bold">اسم الشركة</label>
            <input
              type="text"
              className="form-control form-control-lg rounded-3 border-dark shadow-sm"
              name="company_name"
              value={clientData.company_name}
              onChange={handleChange}
              disabled={loading}
            />
          </div>
        </div>

        <div className="mb-3">
          <label className="form-label fs-5 fw-bold">الملاحظات</label>
          <textarea
            className="form-control form-control-lg rounded-3 border-dark shadow-sm"
            name="notes"
            value={clientData.notes}
            onChange={handleChange}
            disabled={loading}
          />
        </div>
        <div className="text-end">
          <button
            type="submit"
            className="btn btn-dark btn-lg"
            disabled={loading}
          >
            {loading ? (
              "جاري الإضافة..."
            ) : (
              <>
                <i className="fa fa-user-plus me-2"></i>إضافة العميل
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddCustomer;
