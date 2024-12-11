import React, { useState, useEffect } from "react";
import axios from "axios";
import Swal from "sweetalert2"; // استيراد sweetalert2

const CaseTypes = () => {
  const [caseTypes, setCaseTypes] = useState([]); // لتخزين قائمة أنواع القضايا
  const [newCaseType, setNewCaseType] = useState(""); // لتخزين نوع القضية الجديد

  // جلب أنواع القضايا من الـ API
  const fetchCaseTypes = () => {
    const token = localStorage.getItem("token");

    if (token) {
      axios
        .get("https://law-office.al-mosa.com/api/case-categories", {
          headers: { Authorization: `Bearer ${token}` },
        })
        .then((response) => {
          setCaseTypes(response.data); // تعيين البيانات في الحالة
        })
        .catch((err) => {
          Swal.fire({
            icon: "error",
            title: "حدث خطأ",
            text: `خطأ أثناء جلب البيانات: ${err.message}`,
            confirmButtonText: "موافق",
            rtl: true, // دعم اللغة العربية
          });
        });
    } else {
      Swal.fire({
        icon: "warning",
        title: "تحذير",
        text: "التوكن غير موجود",
        confirmButtonText: "موافق",
        rtl: true, // دعم اللغة العربية
      });
    }
  };

  useEffect(() => {
    fetchCaseTypes(); // جلب البيانات عند تحميل الصفحة
  }, []);

  // إرسال نوع قضية جديد
const handleAddCaseType = (e) => {
  e.preventDefault(); // منع إعادة تحميل الصفحة
  const token = localStorage.getItem("token");

  if (newCaseType.trim() === "") {
    // التحقق إذا كان الحقل فارغًا
    Swal.fire({
      icon: "warning",
      title: "الرجاء إدخال نوع القضية",
      text: "لا يمكن إضافة نوع قضية فارغ.",
      confirmButtonText: "موافق",
      rtl: true, // دعم اللغة العربية
    });
    return; // إيقاف التنفيذ إذا كان الحقل فارغًا
  }

  if (token) {
    axios
      .post(
        "https://law-office.al-mosa.com/api/case-category",
        { name: newCaseType },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      )
      .then(() => {
        fetchCaseTypes(); // تحديث الجدول بعد الإضافة
        setNewCaseType(""); // تفريغ الحقل
        Swal.fire({
          icon: "success",
          title: "تم بنجاح",
          text: "تم إضافة نوع القضية بنجاح",
          confirmButtonText: "موافق",
          rtl: true, // دعم اللغة العربية
        });
      })
      .catch((err) => {
        Swal.fire({
          icon: "error",
          title: "حدث خطأ",
          text: `خطأ أثناء الإضافة: ${err.message}`,
          confirmButtonText: "موافق",
          rtl: true, // دعم اللغة العربية
        });
      });
  } else {
    Swal.fire({
      icon: "warning",
      title: "تحذير",
      text: "التوكن غير موجود",
      confirmButtonText: "موافق",
      rtl: true, // دعم اللغة العربية
    });
  }
};


  // التحقق من وجود قضايا مرتبطة بنوع القضية
  const checkIfCaseTypeLinked = (id) => {
    const token = localStorage.getItem("token");

    if (token) {
      return axios
        .get(
          `https://law-office.al-mosa.com/api/cases?case_category_id=${id}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        )
        .then((response) => {
          // إذا كانت البيانات تحتوي على قضايا مرتبطة
          return response.data.length > 0;
        })
        .catch((err) => {
          Swal.fire({
            icon: "error",
            title: "حدث خطأ",
            text: `خطأ أثناء التحقق من القضايا المرتبطة: ${err.message}`,
            confirmButtonText: "موافق",
            rtl: true, // دعم اللغة العربية
          });
          return false;
        });
    } else {
      Swal.fire({
        icon: "warning",
        title: "تحذير",
        text: "التوكن غير موجود",
        confirmButtonText: "موافق",
        rtl: true, // دعم اللغة العربية
      });
      return false;
    }
  };

  // حذف نوع القضية
  const handleDeleteCaseType = (id) => {
    const token = localStorage.getItem("token");

    if (token) {
      checkIfCaseTypeLinked(id).then((isLinked) => {
        if (isLinked) {
          Swal.fire({
            icon: "warning",
            title: "غير قادر على الحذف",
            text: "نوع القضية هذا مرتبط بقضية ولا يمكن حذفه",
            confirmButtonText: "موافق",
            rtl: true, // دعم اللغة العربية
          });
        } else {
          Swal.fire({
            title: "هل أنت متأكد؟",
            text: "لن تتمكن من استعادة هذا النوع بعد الحذف!",
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: "نعم، احذفه!",
            cancelButtonText: "إلغاء",
            rtl: true,
          }).then((result) => {
            if (result.isConfirmed) {
              axios
                .delete(
                  `https://law-office.al-mosa.com/api/case-category/${id}`,
                  {
                    headers: { Authorization: `Bearer ${token}` },
                  }
                )
                .then(() => {
                  fetchCaseTypes(); // تحديث الجدول بعد الحذف
                  Swal.fire({
                    icon: "success",
                    title: "تم الحذف",
                    text: "تم حذف نوع القضية بنجاح",
                    confirmButtonText: "موافق",
                    rtl: true, // دعم اللغة العربية
                  });
                })
                .catch((err) => {
                  Swal.fire({
                    icon: "error",
                    title: "حدث خطأ",
                    text: `خطأ أثناء الحذف: ${err.message}`,
                    confirmButtonText: "موافق",
                    rtl: true, // دعم اللغة العربية
                  });
                });
            }
          });
        }
      });
    } else {
      Swal.fire({
        icon: "warning",
        title: "تحذير",
        text: "التوكن غير موجود",
        confirmButtonText: "موافق",
        rtl: true, // دعم اللغة العربية
      });
    }
  };

  return (
    <div className="container-fluid mt-5">
      <div className="container my-4">
        <div className="row text-center">
          <div className="col-6">
            <form onSubmit={handleAddCaseType} className="row mb-4">
              <div className="col-md-6">
                <input
                  type="text"
                  id="caseType"
                  className="form-control"
                  value={newCaseType}
                  onChange={(e) => setNewCaseType(e.target.value)}
                  placeholder="أدخل نوع القضية"
                />
              </div>
              <div className="col-md-6 d-flex align-items-end">
                <button type="submit" className="btn btn-dark w-100">
                  <i className="fas fa-plus me-2"></i> إضافة
                </button>
              </div>
            </form>
          </div>
          <div className="col-6">
            <h1>انواع القضايا</h1>
          </div>
        </div>
      </div>

      {/* جدول عرض الأنواع */}
      <table className="table table-bordered text-center" dir="rtl">
        <thead className="table-dark">
          <tr>
            <th>#</th>
            <th>نوع القضية</th>
            <th>الإجراءات</th>
          </tr>
        </thead>
        <tbody>
          {caseTypes.length > 0 ? (
            caseTypes.map((type, index) => (
              <tr key={type.id}>
                <td>{index + 1}</td>
                <td>{type.name}</td>
                <td>
                  <button
                    className="btn btn-danger btn-sm"
                    onClick={() => handleDeleteCaseType(type.id)}
                  >
                    حذف
                  </button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="3" className="text-center">
                لا توجد بيانات لعرضها
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default CaseTypes;
