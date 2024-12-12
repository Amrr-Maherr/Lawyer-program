import React, { useEffect, useState } from "react";
import axios from "axios";
import Swal from "sweetalert2";

const Attachments = () => {
  const [cases, setCases] = useState([]);
  const [selectedCase, setSelectedCase] = useState(null);
  const [attachments, setAttachments] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedAttachment, setSelectedAttachment] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  useEffect(() => {
    const fetchCases = async () => {
      const token = localStorage.getItem("token");

      if (!token) {
        setError("Token not found");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        Swal.fire({
          title: "جاري تحميل البيانات...",
          text: "يرجى الانتظار قليلاً.",
          allowOutsideClick: false,
          didOpen: () => {
            Swal.showLoading();
          },
        });

        const response = await axios.get(
          "https://law-office.al-mosa.com/api/cases",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        setCases(response.data.cases);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to fetch cases");
      } finally {
        setLoading(false);
        Swal.close();
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
      setAttachments(response.data);
      setSelectedCase({ customer_id: customerId, case_id: caseId });
      setShowModal(true);
    } catch (err) {
      setError(err.response?.data?.message || "فشل في جلب المرفقات");
    } finally {
      setLoading(false);
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setAttachments([]);
    setSelectedCase(null);
  };
  const handleOpenEditModal = (attachment) => {
    setSelectedAttachment(attachment);
    setShowEditModal(true);
  };
  const handleCloseEditModal = () => {
    setShowEditModal(false);
    setSelectedAttachment(null);
  };
  const handleOpenDeleteModal = (attachment) => {
    setSelectedAttachment(attachment);
    setShowDeleteModal(true);
  };
  const handleCloseDeleteModal = () => {
    setShowDeleteModal(false);
    setSelectedAttachment(null);
  };
  const handleOpenDetailsModal = (attachment) => {
    setSelectedAttachment(attachment);
    setShowDetailsModal(true);
  };
  const handleCloseDetailsModal = () => {
    setShowDetailsModal(false);
    setSelectedAttachment(null);
  };

  const handleAttachmentUpdate = () => {
    if (selectedCase) {
      fetchAttachments(selectedCase.customer_id, selectedCase.case_id);
    }
  };

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

      <div className="mb-4">
        <input
          type="text"
          className="form-control"
          placeholder="ابحث عن قضية..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

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
      <div
        className={`modal fade ${showModal ? "show" : ""}`}
        tabIndex="-1"
        aria-labelledby="attachmentsModal"
        aria-hidden={!showModal}
        style={{ display: showModal ? "block" : "none" }}
      >
        <div className="modal-dialog modal-lg">
          <div className="modal-content">
            <div className="modal-header bg-dark text-white">
              <h5 className="modal-title text-end w-100">مرفقات القضية</h5>
            </div>
            <div className="modal-body" dir="rtl">
              {attachments.length > 0 ? (
                attachments.map((attachment) => (
                  <div
                    className="attachment-item"
                    style={{
                      marginBottom: "20px",
                      padding: "15px",
                      border: "1px solid #ddd",
                      borderRadius: "8px",
                      backgroundColor: "#f9f9f9",
                    }}
                    key={attachment.id}
                  >
                    <p style={{ margin: "10px 0" }}>
                      <strong>
                        <i className="fas fa-file-alt"></i> العنوان:
                      </strong>{" "}
                      {attachment.title || "بدون عنوان"}
                    </p>
                    <p style={{ margin: "10px 0" }}>
                      <strong>
                        <i className="fas fa-file-type"></i> نوع الملف:
                      </strong>{" "}
                      {attachment.file_type}
                    </p>
                    <p style={{ margin: "10px 0" }}>
                      <strong>
                        <i className="fas fa-calendar-alt"></i> تاريخ الإنشاء:
                      </strong>{" "}
                      {new Date(attachment.created_at).toLocaleString()}
                    </p>
                    <p style={{ margin: "10px 0" }}>
                      <strong>
                        <i className="fas fa-download"></i> رابط الملف:
                      </strong>{" "}
                      <a
                        href={attachment.file_path}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="file-link"
                      >
                        تحميل الملف
                      </a>
                    </p>
                    <div
                      className="attachment-actions"
                      style={{ marginTop: "15px" }}
                    >
                      <button
                        onClick={() => handleOpenEditModal(attachment)}
                        className="btn btn-primary text-end ms-2"
                      >
                        <i className="fas fa-edit"></i> تعديل المرفق
                      </button>
                      <button
                        onClick={() => handleOpenDeleteModal(attachment)}
                        className="btn btn-danger text-end ms-2"
                      >
                        <i className="fas fa-trash-alt"></i> مسح المرفق
                      </button>
                      <button
                        onClick={() => handleOpenDetailsModal(attachment)}
                        className="btn btn-info text-end ms-2"
                      >
                        <i className="fas fa-info-circle"></i> عرض التفاصيل
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <p>لا توجد مرفقات لهذه القضية.</p>
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
      <EditAttachmentModal
        show={showEditModal}
        attachment={selectedAttachment}
        onClose={handleCloseEditModal}
        onUpdate={handleAttachmentUpdate}
        error={error}
        setError={setError}
        selectedCase={selectedCase}
      />
      <DeleteAttachmentModal
        show={showDeleteModal}
        attachment={selectedAttachment}
        onClose={handleCloseDeleteModal}
        onUpdate={handleAttachmentUpdate}
        error={error}
        setError={setError}
        selectedCase={selectedCase}
      />
      <DetailsAttachmentModal
        show={showDetailsModal}
        attachment={selectedAttachment}
        onClose={handleCloseDetailsModal}
      />
    </div>
  );
};

const EditAttachmentModal = ({
  show,
  attachment,
  onClose,
  onUpdate,
  error,
  setError,
  selectedCase,
}) => {
  const [newTitle, setNewTitle] = useState("");
  useEffect(() => {
    if (attachment) {
      setNewTitle(attachment.title || "");
    }
  }, [attachment]);

  const handleEditSubmit = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      setError("Token not found");
      return;
    }
    try {
      await axios.post(
        `https://law-office.al-mosa.com/api/customer/${selectedCase.customer_id}/case/${selectedCase.case_id}/update-attachment/${attachment.id}`,
        { title: newTitle },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      Swal.fire("تم التعديل", "تم تعديل المرفق بنجاح", "success");
      onUpdate();
      onClose();
    } catch (err) {
      Swal.fire("خطأ", "حدث خطأ أثناء تعديل المرفق", "error");
    }
  };

  if (!show) return null;

  return (
    <div
      className="modal fade show"
      tabIndex="-1"
      aria-labelledby="editAttachmentModal"
      aria-hidden={!show}
      style={{ display: show ? "block" : "none" }}
    >
      <div className="modal-dialog">
        <div className="modal-content">
          <div className="modal-header bg-dark text-white">
            <h5 className="modal-title text-end w-100">تعديل المرفق</h5>
          </div>
          <div className="modal-body" dir="rtl">
            <div className="mb-3">
              <label className="form-label text-end w-100">عنوان المرفق</label>
              <input
                type="text"
                className="form-control text-end"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
              />
            </div>
          </div>
          <div className="modal-footer">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onClose}
            >
              إغلاق
            </button>
            <button
              type="button"
              className="btn btn-primary"
              onClick={handleEditSubmit}
            >
              تعديل
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const DeleteAttachmentModal = ({
  show,
  attachment,
  onClose,
  onUpdate,
  error,
  setError,
  selectedCase,
}) => {
  const handleDeleteSubmit = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      setError("Token not found");
      return;
    }
    try {
      await axios.delete(
        `https://law-office.al-mosa.com/api/customer/${selectedCase.customer_id}/case/${selectedCase.case_id}/attachment/${attachment.id}`,
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
      onUpdate();
      onClose();
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "حدث خطأ",
        text: err.response?.data?.message || "فشل مسح المرفق",
      });
    }
  };

  if (!show) return null;

  return (
    <div
      className="modal fade show"
      tabIndex="-1"
      aria-labelledby="deleteAttachmentModal"
      aria-hidden={!show}
      style={{ display: show ? "block" : "none" }}
    >
      <div className="modal-dialog">
        <div className="modal-content">
          <div className="modal-header bg-dark text-white">
            <h5 className="modal-title text-end w-100">مسح المرفق</h5>
          </div>
          <div className="modal-body" dir="rtl">
            <p>هل أنت متأكد أنك تريد مسح المرفق؟</p>
          </div>
          <div className="modal-footer">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onClose}
            >
              إغلاق
            </button>
            <button
              type="button"
              className="btn btn-danger"
              onClick={handleDeleteSubmit}
            >
              تأكيد المسح
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const DetailsAttachmentModal = ({ show, attachment, onClose }) => {
  if (!show || !attachment) return null;

  return (
    <div
      className="modal fade show"
      tabIndex="-1"
      aria-labelledby="detailsAttachmentModal"
      aria-hidden={!show}
      style={{ display: show ? "block" : "none" }}
    >
      <div className="modal-dialog">
        <div className="modal-content">
          <div className="modal-header bg-dark text-white">
            <h5 className="modal-title text-end w-100">تفاصيل المرفق</h5>
          </div>
          <div className="modal-body" dir="rtl">
            <p>
              <strong>
                <i className="fas fa-file-alt"></i> العنوان:
              </strong>{" "}
              {attachment.title || "بدون عنوان"}
            </p>
            <p>
              <strong>
                <i className="fas fa-file-type"></i> نوع الملف:
              </strong>{" "}
              {attachment.file_type}
            </p>
            <p>
              <strong>
                <i className="fas fa-calendar-alt"></i> تاريخ الإنشاء:
              </strong>{" "}
              {new Date(attachment.created_at).toLocaleString()}
            </p>
            <p>
              <strong>
                <i className="fas fa-download"></i> رابط الملف:
              </strong>{" "}
              <a
                href={attachment.file_path}
                target="_blank"
                rel="noopener noreferrer"
                className="file-link"
              >
                تحميل الملف
              </a>
            </p>
          </div>
          <div className="modal-footer">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onClose}
            >
              إغلاق
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Attachments;
