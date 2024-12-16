import React, { useState, useEffect, useCallback, useMemo } from "react";
import axios from "axios";
import "bootstrap/dist/css/bootstrap.min.css";
import Swal from "sweetalert2";

// API Service (يمكن نقله إلى ملف منفصل)
const api = {
  fetchAttachments: async (token) => {
    try {
      const response = await axios.get(
        "https://law-office.al-mosa.com/api/attachments",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      return response.data.attachments;
    } catch (error) {
      console.error("Error fetching attachments:", error);
      throw error;
    }
  },
  fetchAttachmentDetails: async (token, customerId, caseId, attachmentId) => {
    try {
      const response = await axios.get(
        `https://law-office.al-mosa.com/api/customer/${customerId}/case/${caseId}/attachment/${attachmentId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching attachment details:", error);
      throw error;
    }
  },
  deleteAttachment: async (token, customerId, caseId, attachmentId) => {
    try {
      await axios.delete(
        `https://law-office.al-mosa.com/api/customer/${customerId}/case/${caseId}/attachment/${attachmentId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
    } catch (error) {
      console.error("Error deleting attachment:", error);
      throw error;
    }
  },
  updateAttachment: async (
    token,
    customerId,
    caseId,
    attachmentId,
    updatedData
  ) => {
    try {
      await axios.post(
        `https://law-office.al-mosa.com/api/customer/${customerId}/case/${caseId}/update-attachment/${attachmentId}`,
        updatedData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
    } catch (error) {
      console.error("Error updating attachment:", error);
      throw error;
    }
  },
};

const Attachments = () => {
  const [attachments, setAttachments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState(null);
  const [modalData, setModalData] = useState(null);
  const [attachmentDetails, setAttachmentDetails] = useState(null);
  const [detailsLoading, setDetailsLoading] = useState(false);

  useEffect(() => {
    const fetchAttachmentsData = async () => {
      Swal.fire({
        title: "جاري تحميل مرفقات القضايا...",
        text: "يرجى الانتظار",
        allowOutsideClick: false,
        showConfirmButton: false,
        didOpen: () => {
          Swal.showLoading();
        },
      });
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          Swal.close();
          setError("لم يتم العثور على التوكن. يرجى تسجيل الدخول.");
          setLoading(false);
          return;
        }

        const fetchedAttachments = await api.fetchAttachments(token);
        setAttachments(fetchedAttachments);
      } catch (error) {
        Swal.close();
        console.error("Error fetching attachments:", error);
        if (error.response && error.response.status === 401) {
          setError("غير مصرح. يرجى تسجيل الدخول مرة أخرى.");
          Swal.fire({
            icon: "error",
            title: "خطأ",
            text: "غير مصرح. يرجى تسجيل الدخول مرة أخرى.",
          });
        } else {
          Swal.fire({
            icon: "error",
            title: "خطأ",
            text: "فشل في جلب المرفقات. يرجى المحاولة مرة أخرى لاحقًا.",
          });
          setError("فشل في جلب المرفقات. يرجى المحاولة مرة أخرى لاحقًا.");
        }
      } finally {
        setLoading(false);
        Swal.close();
      }
    };

    fetchAttachmentsData();
  }, []);

  const getFileIconClass = (fileType) => {
    switch (fileType) {
      case "pdf":
        return "fas fa-file-pdf";
      case "jpg":
      case "jpeg":
      case "png":
      case "gif":
        return "fas fa-file-image";
      case "md":
      case "txt":
      case "js":
      case "css":
        return "fas fa-file-code";
      default:
        return "fas fa-file";
    }
  };

  const handleSearch = (event) => {
    setSearchTerm(event.target.value);
  };

  const handleEdit = (attachment) => {
    setModalType("edit");
    setModalData(attachment);
    setShowModal(true);
  };

  const handleDetails = useCallback(async (attachment) => {
    setDetailsLoading(true);
    Swal.fire({
      title: "جاري تحميل تفاصيل الملف...",
      text: "يرجى الانتظار",
      allowOutsideClick: false,
      showConfirmButton: false,
      didOpen: () => {
        Swal.showLoading();
      },
    });
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        Swal.fire({
          icon: "error",
          title: "خطأ",
          text: "لم يتم العثور على التوكن. يرجى تسجيل الدخول.",
        });
        return;
      }
      const details = await api.fetchAttachmentDetails(
        token,
        attachment.customer_id,
        attachment.case_id,
        attachment.attachment_id
      );
      setAttachmentDetails(details);
      setTimeout(() => {
        Swal.close();
        setModalType("details");
        setModalData(attachment);
        setShowModal(true);
      }, 500);
    } catch (error) {
      console.error("Error fetching attachment details:", error);
      Swal.fire({
        icon: "error",
        title: "خطأ",
        text: "فشل في جلب تفاصيل المرفق. يرجى المحاولة مرة أخرى لاحقًا.",
      });
    } finally {
      setDetailsLoading(false);
      Swal.close();
    }
  }, []);

  const handleDelete = useCallback(
    async (attachmentId) => {
      const attachmentToDelete = attachments.find(
        (attachment) => attachment.attachment_id === attachmentId
      );
      if (!attachmentToDelete) {
        Swal.fire({
          icon: "error",
          title: "خطأ",
          text: "المرفق غير موجود.",
        });
        return;
      }

      Swal.fire({
        title: "هل أنت متأكد من أنك تريد حذف هذا المرفق؟",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#d33",
        cancelButtonColor: "#3085d6",
        confirmButtonText: "نعم، احذفه!",
        cancelButtonText: "إلغاء",
      }).then(async (result) => {
        if (result.isConfirmed) {
          try {
            const token = localStorage.getItem("token");
            if (!token) {
              Swal.fire({
                icon: "error",
                title: "خطأ",
                text: "لم يتم العثور على التوكن. يرجى تسجيل الدخول.",
              });
              return;
            }
            await api.deleteAttachment(
              token,
              attachmentToDelete.customer_id,
              attachmentToDelete.case_id,
              attachmentId
            );
            Swal.fire({
              icon: "success",
              title: "تم",
              text: "تم حذف المرفق بنجاح.",
            });
            setAttachments((prevAttachments) =>
              prevAttachments.filter(
                (attachment) => attachment.attachment_id !== attachmentId
              )
            );
          } catch (error) {
            console.error("Error deleting attachment:", error);
            Swal.fire({
              icon: "error",
              title: "خطأ",
              text: "حدث خطأ أثناء حذف المرفق.",
            });
          }
        }
      });
    },
    [attachments]
  );

  const closeModal = () => {
    setShowModal(false);
    setModalType(null);
    setModalData(null);
    setAttachmentDetails(null);
  };

  const handleEditAttachment = async (attachmentId, updatedData) => {
    Swal.fire({
      title: "هل أنت متأكد من تعديل اسم هذا المرفق؟",
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "نعم، قم بالتعديل!",
      cancelButtonText: "إلغاء",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const token = localStorage.getItem("token");
          if (!token) {
            Swal.fire({
              icon: "error",
              title: "خطأ",
              text: "لم يتم العثور على التوكن. يرجى تسجيل الدخول.",
            });
            return;
          }
          const { customer_id, case_id } = modalData;
          await api.updateAttachment(
            token,
            customer_id,
            case_id,
            attachmentId,
            updatedData
          );

          Swal.fire({
            icon: "success",
            title: "تم",
            text: "تم تعديل المرفق بنجاح.",
          });
          setAttachments(
            attachments.map((attachment) =>
              attachment.attachment_id === attachmentId
                ? { ...attachment, ...updatedData }
                : attachment
            )
          );
          closeModal();
        } catch (error) {
          console.error("Error updating attachment:", error);
          Swal.fire({
            icon: "error",
            title: "خطأ",
            text: "حدث خطأ أثناء تعديل المرفق.",
          });
        }
      }
    });
  };

  const filteredAttachments = useMemo(() => {
    return attachments.filter((attachment) =>
      attachment.title.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [attachments, searchTerm]);

  if (loading) {
    return null;
  }

  if (error) {
    return null;
  }

  return (
    <div className="container-fluid mt-4">
      <h1 className="text-right">قائمة المرفقات</h1>
      <div className="mb-3 text-right">
        <input
          type="text"
          className="form-control"
          placeholder="البحث بواسطة اسم الملف..."
          value={searchTerm}
          onChange={handleSearch}
          style={{ textAlign: "right" }}
        />
      </div>
      <div className="row">
        {filteredAttachments.map((attachment) => (
          <div
            key={attachment.attachment_id}
            className="col-sm-12 col-md-6 col-lg-4 mb-3"
          >
            <div
              className="card attachment-card h-100"
              style={{
                boxShadow: "0 0.125rem 0.25rem rgba(0,0,0,0.075)",
                borderRadius: "0.50rem",
                backgroundColor: "white",
                padding: "0px",
              }}
            >
              <div
                className="card-header text-white"
                style={{
                  backgroundColor: "#343a40",
                  borderTopLeftRadius: "0.50rem",
                  borderTopRightRadius: "0.50rem",
                  padding: "10px",
                  textAlign: "right",
                }}
              >
                {attachment.title}
              </div>
              <div className="card-body d-flex flex-column">
                <div className="d-flex align-items-center mb-3">
                  <i
                    className={`${getFileIconClass(
                      attachment["file type"]
                    )} me-2`}
                    style={{ fontSize: "2em" }}
                  ></i>
                </div>
                <p
                  className="card-text text-right mb-2"
                  style={{ padding: "10px" }}
                >
                  <strong>رقم القضية:</strong> {attachment.case_number}
                  <br />
                  <strong>العميل:</strong> {attachment.customer_name}
                  <br />
                  <strong>نوع الملف:</strong> {attachment["file type"]}
                </p>
                <div
                  className="mt-auto d-flex justify-content-between align-items-center"
                  style={{ padding: "10px" }}
                >
                  <a
                    href={attachment["file path"]}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-outline-primary btn-sm d-flex align-items-center"
                  >
                    <i className="fas fa-download me-1"></i>
                    عرض الملف
                  </a>
                  <div>
                    <button
                      className="btn btn-outline-secondary btn-sm me-1"
                      onClick={() => handleEdit(attachment)}
                    >
                      <i className="fas fa-edit"></i> تعديل
                    </button>
                    <button
                      className="btn btn-outline-danger btn-sm me-1"
                      onClick={() => handleDelete(attachment.attachment_id)}
                    >
                      <i className="fas fa-trash"></i> مسح
                    </button>
                    <button
                      className="btn btn-outline-info btn-sm"
                      onClick={() => handleDetails(attachment)}
                    >
                      <i className="fas fa-info-circle"></i> تفاصيل
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* موديل التعديل */}
      {showModal && modalType === "edit" && (
        <div
          className="modal fade show d-block"
          style={{ backgroundColor: "rgba(0, 0, 0, 0.5)" }}
          tabIndex="-1"
          role="dialog"
        >
          <div className="modal-dialog modal-lg" role="document">
            <div className="modal-content">
              <div
                className="modal-header bg-dark text-white"
                style={{ direction: "rtl" }}
              >
                <h5 className="modal-title text-right">تعديل المرفق</h5>
              </div>
              <div className="modal-body" style={{ direction: "rtl" }}>
                {modalData && (
                  <table className="table table-bordered">
                    <thead>
                      <tr>
                        <th scope="col" className="text-right">
                          اسم الحقل
                        </th>
                        <th scope="col" className="text-right">
                          القيمة
                        </th>
                        <th scope="col" className="text-right">
                          تعديل
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <th scope="row" className="text-right">
                          اسم الملف
                        </th>
                        <td className="text-right">{modalData.title}</td>
                        <td className="text-right">
                          {" "}
                          <input
                            type="text"
                            className="form-control text-right"
                            placeholder="اسم الملف الجديد"
                            defaultValue={modalData.title}
                            onChange={(e) =>
                              setModalData({
                                ...modalData,
                                title: e.target.value,
                              })
                            }
                          />
                        </td>
                      </tr>
                    </tbody>
                  </table>
                )}
              </div>
              <div
                className="modal-footer d-flex justify-content-end"
                style={{ direction: "rtl" }}
              >
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={() =>
                    handleEditAttachment(modalData.attachment_id, {
                      title: modalData.title,
                    })
                  }
                >
                  حفظ التعديلات
                </button>
                <button
                  type="button"
                  className="btn btn-secondary"
                  data-dismiss="modal"
                  onClick={closeModal}
                >
                  إغلاق
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* موديل التفاصيل */}
      {showModal && modalType === "details" && (
        <div
          className="modal fade show d-block"
          style={{ backgroundColor: "rgba(0, 0, 0, 0.5)" }}
          tabIndex="-1"
          role="dialog"
        >
          <div className="modal-dialog modal-lg" role="document">
            <div className="modal-content">
              <div
                className="modal-header bg-dark text-white"
                style={{ direction: "rtl" }}
              >
                <h5 className="modal-title text-right">تفاصيل المرفق</h5>
              </div>
              <div className="modal-body" style={{ direction: "rtl" }}>
                {attachmentDetails && (
                  <table className="table table-bordered">
                    <thead>
                      <tr>
                        <th scope="col" className="text-right">
                          اسم الحقل
                        </th>
                        <th scope="col" className="text-right">
                          القيمة
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <th scope="row" className="text-right">
                          اسم الملف
                        </th>
                        <td className="text-right">
                          {attachmentDetails.title}
                        </td>
                      </tr>
                      <tr>
                        <th scope="row" className="text-right">
                          نوع الملف
                        </th>
                        <td className="text-right">
                          {attachmentDetails.file_type}
                        </td>
                      </tr>
                      <tr>
                        <th scope="row" className="text-right">
                          مسار الملف
                        </th>
                        <td className="text-right">
                          <a
                            href={attachmentDetails.file_path}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            عرض الملف
                          </a>
                        </td>
                      </tr>
                      <tr>
                        <th scope="row" className="text-right">
                          رقم القضية
                        </th>
                        <td className="text-right">
                          {attachmentDetails.case.case_number}
                        </td>
                      </tr>
                      <tr>
                        <th scope="row" className="text-right">
                          اسم المحكمة
                        </th>
                        <td className="text-right">
                          {attachmentDetails.case.court_name}
                        </td>
                      </tr>
                      <tr>
                        <th scope="row" className="text-right">
                          اسم القاضي
                        </th>
                        <td className="text-right">
                          {attachmentDetails.case.judge_name}
                        </td>
                      </tr>
                      <tr>
                        <th scope="row" className="text-right">
                          اسم العميل
                        </th>
                        <td className="text-right">
                          {attachmentDetails.case.customer.name}
                        </td>
                      </tr>
                      <tr>
                        <th scope="row" className="text-right">
                          رقم الهاتف
                        </th>
                        <td className="text-right">
                          {attachmentDetails.case.customer.phone}
                        </td>
                      </tr>
                      <tr>
                        <th scope="row" className="text-right">
                          البريد الإلكتروني
                        </th>
                        <td className="text-right">
                          {attachmentDetails.case.customer.email}
                        </td>
                      </tr>
                      <tr>
                        <th scope="row" className="text-right">
                          عنوان القضية
                        </th>
                        <td className="text-right">
                          {attachmentDetails.case.case_title}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                )}
              </div>
              <div
                className="modal-footer d-flex justify-content-end"
                style={{ direction: "rtl" }}
              >
                <button
                  type="button"
                  className="btn btn-secondary"
                  data-dismiss="modal"
                  onClick={closeModal}
                >
                  إغلاق
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Attachments;
