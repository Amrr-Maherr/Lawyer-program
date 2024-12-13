import React, { useState, useEffect } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import "sweetalert2/dist/sweetalert2.min.css";

const Attachments = () => {
  const [attachments, setAttachments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedAttachment, setSelectedAttachment] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  useEffect(() => {
    const fetchAttachments = async () => {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem("token");
      try {
        const response = await axios.get(
          "https://law-office.al-mosa.com/api/attachments",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        setAttachments(response.data.attachments);
        console.log("بيانات المرفقات:", response.data.attachments);
        Swal.close(); // إغلاق تنبيه التحميل بعد النجاح
      } catch (err) {
        setError(err.message || "فشل في تحميل المرفقات.");
        Swal.fire({
          icon: "error",
          title: "خطأ!",
          text: err.message || "فشل في تحميل المرفقات.",
          confirmButtonText: "موافق",
          confirmButtonColor: "#dc3545",
        });
        console.error("خطأ في تحميل المرفقات:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchAttachments();
  }, []);

  if (loading) {
    Swal.fire({
      title: "جاري التحميل...",
      text: "الرجاء الانتظار حتى يتم تحميل المرفقات.",
      allowOutsideClick: false,
      showConfirmButton: false,
      didOpen: () => {
        Swal.showLoading();
      },
    });
    return null;
  }

  if (error) {
    return null; // لا يتم عرض شيء آخر إذا كان هناك خطأ, تم عرض الalert بالفعل
  }

  const handleAction = async (attachment, action) => {
    setSelectedAttachment(attachment);
    switch (action) {
      case "delete":
        Swal.fire({
          title: "تأكيد الحذف",
          text: `هل أنت متأكد أنك تريد حذف المرفق "${attachment.title}"؟`,
          icon: "warning",
          showCancelButton: true,
          confirmButtonColor: "#d33",
          cancelButtonColor: "#3085d6",
          confirmButtonText: "نعم، احذف!",
          cancelButtonText: "إلغاء",
        }).then(async (result) => {
          if (result.isConfirmed) {
            try {
              console.log("حذف المرفق", attachment);
              Swal.fire({
                icon: "success",
                title: "تم الحذف!",
                text: "تم حذف المرفق بنجاح.",
                confirmButtonText: "موافق",
              });
            } catch (error) {
              Swal.fire({
                icon: "error",
                title: "فشل الحذف!",
                text: "حدث خطأ أثناء حذف المرفق.",
                confirmButtonText: "موافق",
              });
              console.error("خطأ في الحذف", error);
            }
          }
        });
        break;
      case "edit":
        setShowEditModal(true);
        break;
      case "details":
        Swal.fire({
          title: "جاري تحميل التفاصيل...",
          text: "الرجاء الانتظار.",
          allowOutsideClick: false,
          showConfirmButton: false,
          didOpen: () => {
            Swal.showLoading();
          },
        });
        setTimeout(() => {
          Swal.close();
          setShowDetailsModal(true);
        }, 500);
        break;
      default:
        console.log(`Action "${action}" غير مدعوم`);
    }
  };

  const handleSaveEdit = async () => {
    try {
      console.log("تم حفظ التعديلات", selectedAttachment);

      Swal.fire({
        icon: "success",
        title: "تم التعديل!",
        text: "تم تعديل بيانات المرفق بنجاح.",
        confirmButtonText: "موافق",
      });
      handleCloseModal();
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "فشل التعديل!",
        text: "حدث خطأ أثناء تعديل بيانات المرفق.",
        confirmButtonText: "موافق",
      });
      console.error("خطأ في التعديل", error);
    }
  };

  const handleCloseModal = () => {
    setShowEditModal(false);
    setShowDetailsModal(false);
    setSelectedAttachment(null);
  };

  const handleSearch = (event) => {
    setSearchTerm(event.target.value);
  };

  const filteredAttachments = attachments.filter((attachment) =>
    attachment.title.toLowerCase().includes(searchTerm.toLowerCase())
  );
  return (
    <div className="container mt-5 text-end" dir="rtl">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1 className="fw-bold text-secondary">قائمة المرفقات</h1>
        <input
          type="text"
          placeholder="ابحث عن مرفق"
          className="form-control w-25"
          value={searchTerm}
          onChange={handleSearch}
        />
      </div>
      {filteredAttachments.length > 0 ? (
        <div className="row row-cols-1 row-cols-md-3 g-4">
          {filteredAttachments.map((attachment) => (
            <div className="col" key={attachment.attachment_id}>
              <div className="card h-100 shadow-lg border-0 rounded-3">
                <div className="card-header bg-dark text-white d-flex justify-content-between align-items-center">
                  <h5 className="m-0 ">{attachment.title}</h5>
                  <span
                    className={`badge ${
                      attachment["file type"] === "pdf"
                        ? "bg-danger"
                        : attachment["file type"] === "docx"
                        ? "bg-info"
                        : "bg-secondary"
                    }`}
                  >
                    {attachment["file type"]}
                  </span>
                </div>
                <div className="card-body p-4 d-flex flex-column">
                  <div className="mt-auto d-flex justify-content-between">
                    <a
                      href={attachment["file path"]}
                      className="btn btn-outline-primary btn-sm"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <i className="fas fa-download me-1"></i> تحميل
                    </a>
                    <div className="d-flex">
                      <button
                        className="btn btn-outline-danger btn-sm ms-1"
                        onClick={() => handleAction(attachment, "delete")}
                      >
                        <i className="fas fa-trash"></i>
                      </button>
                      <button
                        className="btn btn-outline-info btn-sm ms-1"
                        onClick={() => handleAction(attachment, "edit")}
                      >
                        <i className="fas fa-edit"></i>
                      </button>
                      <button
                        className="btn btn-outline-secondary btn-sm ms-1"
                        onClick={() => handleAction(attachment, "details")}
                      >
                        <i className="fas fa-eye"></i>
                      </button>
                    </div>
                  </div>
                </div>
                <div className="card-footer text-muted text-center bg-light border-top-0">
                  <small>المعرف: {attachment.attachment_id}</small>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        Swal.fire({
          icon: "info",
          title: "تنبيه",
          html: '<div class="text-center"><p>لا يوجد مرفقات.</p><table class="table table-bordered mt-3"><thead class="table-light"><tr><th>ID</th><th>Title</th><th>File Type</th></tr></thead><tbody></tbody></table></div>',
          confirmButtonText: "موافق",
          confirmButtonColor: "#17a2b8",
        })
      )}

      {/* Modal for Editing */}
      <div
        className={`modal fade ${showEditModal ? "show d-block" : ""}`}
        tabIndex="-1"
        style={{ display: showEditModal ? "block" : "none" }}
      >
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content" dir="rtl">
            <div className="modal-header bg-dark text-white">
              <h5 className="modal-title text-end">تعديل المرفق</h5>
            </div>
            <div className="modal-body text-end">
              {selectedAttachment && (
                <form>
                  <table className="table table-bordered">
                    <tbody>
                      <tr>
                        <th className="text-end">اسم المرفق</th>
                        <td>
                          <input
                            type="text"
                            className="form-control text-end"
                            id="title"
                            value={selectedAttachment.title}
                          />
                        </td>
                      </tr>
                      {/* Add other input fields for editing in table rows */}
                    </tbody>
                  </table>
                </form>
              )}
            </div>
            <div className="modal-footer">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={handleCloseModal}
              >
                إغلاق
              </button>
              <button
                type="button"
                className="btn btn-primary"
                onClick={handleSaveEdit}
              >
                حفظ التعديلات
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Modal for Details */}
      <div
        className={`modal fade ${showDetailsModal ? "show d-block" : ""}`}
        tabIndex="-1"
        style={{ display: showDetailsModal ? "block" : "none" }}
      >
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content" dir="rtl">
            <div className="modal-header bg-dark text-white">
              <h5 className="modal-title text-end">تفاصيل المرفق</h5>
            </div>
            <div className="modal-body text-end">
              {selectedAttachment && (
                <table className="table table-bordered">
                  <tbody>
                    <tr>
                      <th className="text-end">المعرف</th>
                      <td>{selectedAttachment.attachment_id}</td>
                    </tr>
                    <tr>
                      <th className="text-end">اسم المرفق</th>
                      <td>{selectedAttachment.title}</td>
                    </tr>
                    <tr>
                      <th className="text-end">نوع الملف</th>
                      <td>{selectedAttachment["file type"]}</td>
                    </tr>
                    <tr>
                      <th className="text-end">رابط الملف</th>
                      <td>
                        <a
                          href={selectedAttachment["file path"]}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          فتح الرابط
                        </a>
                      </td>
                    </tr>
                  </tbody>
                </table>
              )}
            </div>
            <div className="modal-footer">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={handleCloseModal}
              >
                إغلاق
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Attachments;
