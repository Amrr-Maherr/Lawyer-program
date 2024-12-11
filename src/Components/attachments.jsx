import React, { useEffect, useState } from "react";
import axios from "axios";
import Swal from "sweetalert2";

const Attachments = () => {
  const [cases, setCases] = useState([]); // لتخزين القضايا
  const [selectedCase, setSelectedCase] = useState(null); // لتحديد القضية المختارة
  const [attachments, setAttachments] = useState([]); // لتخزين المرفقات
  const [searchQuery, setSearchQuery] = useState(""); // لتخزين نص البحث
  const [error, setError] = useState(null); // لتخزين الأخطاء
  const [loading, setLoading] = useState(true); // حالة التحميل

  // جلب القضايا من API
  useEffect(() => {
    const fetchCases = async () => {
      const token = localStorage.getItem("token"); // جلب التوكن من localStorage

      if (!token) {
        setError("Token not found");
        setLoading(false);
        return;
      }

      try {
        setLoading(true); // بداية التحميل
        Swal.fire({
          title: "جاري تحميل البيانات...",
          text: "يرجى الانتظار قليلاً.",
          allowOutsideClick: false,
          didOpen: () => {
            Swal.showLoading(); // إظهار مؤشر التحميل
          },
        });

        const response = await axios.get(
          "https://law-office.al-mosa.com/api/cases",
          {
            headers: {
              Authorization: `Bearer ${token}`, // تضمين التوكن في الهيدر
            },
          }
        );

        setCases(response.data.cases); // تخزين القضايا في state
      } catch (err) {
        setError(err.response?.data?.message || "Failed to fetch cases");
      } finally {
        setLoading(false); // إنهاء التحميل
        Swal.close(); // إغلاق نافذة التحميل
      }
    };

    fetchCases();
  }, []);

const fetchAttachments = async (customerId, caseId) => {
  const token = localStorage.getItem("token");

  if (!token) {
    setError("Token not found");
    return;
  }

  setLoading(true);

  try {
    const response = await axios.get(
      `https://law-office.al-mosa.com/api/customer/${customerId}/case/${caseId}/attachments`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    // عرض المرفقات باستخدام SweetAlert
    Swal.fire({
      html: `
    <div style="font-size: 18px; line-height: 1.6;">
      <strong><i class="fas fa-clipboard-list"></i> المرفقات:</strong>
      ${
        response.data.length > 0
          ? response.data
              .map(
                (attachment) => `
                  <div class="attachment-item" style="margin-bottom: 20px; padding: 15px; border: 1px solid #ddd; border-radius: 8px; background-color: #f9f9f9;">
                    <p style="margin: 10px 0;"><strong><i class="fas fa-file-alt"></i> العنوان:</strong> ${
                      attachment.title || "بدون عنوان"
                    }</p>
                    <p style="margin: 10px 0;"><strong><i class="fas fa-file-type"></i> نوع الملف:</strong> ${
                      attachment.file_type
                    }</p>
                    <p style="margin: 10px 0;"><strong><i class="fas fa-calendar-alt"></i> تاريخ الإنشاء:</strong> ${new Date(
                      attachment.created_at
                    ).toLocaleString()}</p>
                    <p style="margin: 10px 0;"><strong><i class="fas fa-download"></i> رابط الملف:</strong> <a href="${
                      attachment.file_path
                    }" target="_blank" rel="noopener noreferrer" class="file-link">تحميل الملف</a></p>
                    <div class="attachment-actions" style="margin-top: 15px;">
                      <a href="#" onClick="editAttachment(${
                        attachment.id
                      })" class="action-link" style="margin-right: 15px; text-decoration: none; color: #007bff; font-weight: bold;"><i class="fas fa-edit"></i> تعديل المرفق</a>
                      <a href="#" onClick="deleteAttachment(${
                        attachment.id
                      })" class="action-link" style="margin-right: 15px; text-decoration: none; color: #dc3545; font-weight: bold;"><i class="fas fa-trash-alt"></i> مسح المرفق</a>
                      <a href="#" onClick="showAttachmentDetails(${
                        attachment.id
                      })" class="action-link" style="text-decoration: none; color: #28a745; font-weight: bold;"><i class="fas fa-info-circle"></i> عرض تفاصيل المرفق</a>
                    </div>
                  </div>`
              )
              .join("")
          : "<p>لا توجد مرفقات لهذه القضية.</p>"
      }
    </div>`,
      showCloseButton: true,
      focusConfirm: false,
    });

    // إضافة وظائف التعديل والمسح
    window.editAttachment = (attachmentId) => {
      Swal.fire({
        title: "تعديل المرفق",
        text: `هل أنت متأكد أنك تريد تعديل المرفق ${attachmentId}?`,
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "نعم، تعديل",
        cancelButtonText: "إلغاء",
      }).then((result) => {
        if (result.isConfirmed) {
          // تنفيذ كود تعديل المرفق هنا
          console.log("تعديل المرفق ID:", attachmentId);
        }
      });
    };

    window.deleteAttachment = (attachmentId) => {
      Swal.fire({
        title: "مسح المرفق",
        text: `هل أنت متأكد أنك تريد مسح المرفق ${attachmentId}?`,
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "نعم، مسح",
        cancelButtonText: "إلغاء",
      }).then((result) => {
        if (result.isConfirmed) {
          // تنفيذ كود مسح المرفق هنا
          console.log("مسح المرفق ID:", attachmentId);
        }
      });
    };

    window.showAttachmentDetails = (attachmentId) => {
      // يمكنك هنا إظهار تفاصيل إضافية للمرفق، مثل: عرض وصف، بيانات إضافية، أو فتح صفحة جديدة.
      console.log("عرض تفاصيل المرفق ID:", attachmentId);
    };
  } catch (err) {
    setError(err.response?.data?.message || "فشل في جلب المرفقات");
  } finally {
    setLoading(false);
  }
};


  // وظيفة تعديل المرفق
  const editAttachment = (attachmentId) => {
    Swal.fire({
      title: "تعديل المرفق",
      input: "text",
      inputLabel: "عنوان المرفق",
      inputValue: "", // يمكنك تحديد قيمة افتراضية هنا
      showCancelButton: true,
      confirmButtonText: "تعديل",
      cancelButtonText: "إلغاء",
      preConfirm: (newTitle) => {
        // تحديث المرفق
        const token = localStorage.getItem("token");
        if (!token) {
          setError("Token not found");
          return;
        }

        return axios.put(
          `https://law-office.al-mosa.com/api/attachments/${attachmentId}`,
          { title: newTitle },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
      },
    })
      .then((result) => {
        if (result.isConfirmed) {
          Swal.fire("تم التعديل", "تم تعديل المرفق بنجاح", "success");
        }
      })
      .catch((err) => {
        Swal.fire("خطأ", "حدث خطأ أثناء تعديل المرفق", "error");
      });
  };

const deleteAttachment = async (attachmentId) => {
  const token = localStorage.getItem("token");

  if (!token) {
    setError("Token not found");
    return;
  }

  Swal.fire({
    title: "مسح المرفق",
    text: `هل أنت متأكد أنك تريد مسح المرفق؟`,
    icon: "warning",
    showCancelButton: true,
    confirmButtonText: "نعم، مسح",
    cancelButtonText: "إلغاء",
  }).then(async (result) => {
    if (result.isConfirmed) {
      try {
        const response = await axios.delete(
          `https://law-office.al-mosa.com/api/customer/${selectedCase.customer_id}/case/${selectedCase.case_id}/attachment/${attachmentId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        Swal.fire({
          icon: "success",
          title: "تم مسح المرفق بنجاح",
          showConfirmButton: false,
          timer: 1500,
        });
        // يمكنك تحديث الحالة أو تحميل البيانات مجددًا هنا إذا كنت بحاجة لذلك
      } catch (err) {
        Swal.fire({
          icon: "error",
          title: "حدث خطأ",
          text: err.response?.data?.message || "فشل مسح المرفق",
        });
      }
    }
  });
};


  // تصفية القضايا بناءً على نص البحث
  const filteredCases = cases.filter(
    (caseItem) =>
      caseItem.case_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
      caseItem.customer_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error}</p>;

  return (
    <div className="container mt-5">
      <h1 className="text-center mb-4">مرفقات القضايا</h1>

      {/* حقل البحث في القضايا */}
      <div className="mb-4">
        <input
          type="text"
          className="form-control"
          placeholder="ابحث عن قضية..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)} // تحديث نص البحث
        />
      </div>

      {/* قائمة القضايا */}
      <div className="row">
        {filteredCases.length > 0 ? (
          filteredCases.map((caseItem) => (
            <div className="col-md-6  col-lg-4 mb-4" key={caseItem.case_id}>
              <div className="card shadow-sm">
                <div className="card-body">
                  <h5 className="card-title">
                    قضية رقم: {caseItem.case_number}
                  </h5>
                  <p className="card-text">
                    اسم العميل: {caseItem.customer_name}
                  </p>
                  <button
                    className="btn btn-dark w-100"
                    onClick={() =>
                      fetchAttachments(caseItem.customer_id, caseItem.case_id)
                    }
                  >
                    <i className="fas fa-paperclip"></i> عرض المرفقات
                  </button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <p>لا توجد قضايا مطابقة لنتائج البحث.</p>
        )}
      </div>
    </div>
  );
};

export default Attachments;
