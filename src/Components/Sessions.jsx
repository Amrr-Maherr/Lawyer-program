import React, { useState, useEffect, useMemo } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import Swal from "sweetalert2";
import axios from "axios";

function Sessions() {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSession, setSelectedSession] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editSessionData, setEditSessionData] = useState(null);
  const [editSessionForm, setEditSessionForm] = useState({
    title: "",
    description: "",
    date: "",
  });

  const API_BASE_URL = "https://law-office.al-mosa.com/api";
  const getAuthToken = () => {
    return localStorage.getItem("token");
  };
  const createAxiosInstance = () => {
    const token = getAuthToken();
    return axios.create({
      baseURL: API_BASE_URL,
      headers: {
        Authorization: token ? `Bearer ${token}` : null,
      },
    });
  };
  const api = createAxiosInstance();

  useEffect(() => {
    Swal.fire({
      title: "جاري تحميل الجلسات...",
      allowOutsideClick: false,
      showConfirmButton: false,
      didOpen: async () => {
        Swal.showLoading();
        try {
          const response = await api.get("/sessions");
          setSessions([...response.data.sessions].reverse());
        } catch (err) {
          Swal.fire("خطأ!", "فشل تحميل الجلسات.", "error");
        } finally {
          Swal.close();
          setLoading(false);
        }
      },
    });
  }, []);

  const handleSearch = (event) => {
    setSearchTerm(event.target.value);
  };

  const filteredSessions = useMemo(() => {
    return sessions.filter((session) => {
      return (
        session.title &&
        session.title.toLowerCase().includes(searchTerm.toLowerCase())
      );
    });
  }, [sessions, searchTerm]);

  const handleDeleteSession = async (session) => {
    Swal.fire({
      title: "هل أنت متأكد؟",
      text: "لن تتمكن من التراجع عن هذا الإجراء!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "نعم، احذفها!",
      cancelButtonText: "إلغاء",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const { customer_id, case_id, session_id } = session;
          await api.delete(
            `/customer/${customer_id}/case/${case_id}/session/${session_id}`
          );
          setSessions(sessions.filter((s) => s.session_id !== session_id));
          Swal.fire("تم الحذف!", "تم حذف الجلسة بنجاح.", "success");
        } catch (err) {
          Swal.fire("خطأ!", "فشل حذف الجلسة.", "error");
        }
      }
    });
  };

  const handleEditSession = (session) => {
    setEditSessionData(session);
    setEditSessionForm({
      title: session.title,
      description: session.description,
      date: session.date,
    });
    setIsModalOpen(false);
    setIsEditModalOpen(true);
  };

  const handleEditSessionInputChange = (e) => {
    const { name, value } = e.target;
    setEditSessionForm({ ...editSessionForm, [name]: value });
  };

  const handleUpdateSession = async () => {
    Swal.fire({
      title: "جاري تحديث الجلسة...",
      allowOutsideClick: false,
      showConfirmButton: false,
      didOpen: async () => {
        Swal.showLoading();
        try {
          const { customer_id, case_id, session_id } = editSessionData;
          const response = await api.post(
            `/customer/${customer_id}/case/${case_id}/update-session/${session_id}`,
            editSessionForm
          );

          if (response.status === 200) {
            const updatedSessions = sessions.map((session) =>
              session.session_id === editSessionData.session_id
                ? { ...session, ...editSessionForm }
                : session
            );

            setSessions(updatedSessions);
            handleCloseEditModal(true);
            Swal.fire("تم التحديث!", "تم تحديث الجلسة بنجاح.", "success");
          } else {
            const error = await response.json();
            Swal.fire("خطأ!", error.message || "فشل تحديث الجلسة.", "error");
          }
        } catch (error) {
          Swal.fire("خطأ!", "فشل تحديث الجلسة.", "error");
        } finally {
          Swal.close();
        }
      },
    });
  };

  const handleShowDetails = async (session) => {
    Swal.fire({
      title: "جاري تحميل التفاصيل...",
      allowOutsideClick: false,
      showConfirmButton: false,
      didOpen: async () => {
        Swal.showLoading();
        try {
          const response = await api.get(
            `/customer/${session.customer_id}/case/${session.case_id}/session/${session.session_id}`
          );
          setSelectedSession(response.data);
          setIsEditModalOpen(false);
          setIsModalOpen(true);
          Swal.close();
        } catch (err) {
          Swal.fire("خطأ!", "فشل تحميل تفاصيل الجلسة.", "error");
        }
      },
    });
  };

  const handleCloseModal = () => {
    setSelectedSession(null);
    setIsModalOpen(false);
  };

  const handleCloseEditModal = () => {
    setEditSessionData(null);
    setIsEditModalOpen(false);
  };

  function SessionCard({
    session,
    handleShowDetails,
    handleDeleteSession,
    handleEditSession,
  }) {
    return (
      <div className="col-xl-4 my-5">
        <div className="card h-100">
          <div className="card-header bg-dark text-white text-end">
            <h5 className="card-title mb-0">{session.title}</h5>
          </div>
          <div className="card-body">
            <p className="card-text">
              <strong>رقم القضية:</strong> {session.case_number}
            </p>
            <p className="card-text">
              <strong>اسم العميل:</strong> {session.customer_name}
            </p>
            <p className="card-text">
              <strong>الوصف:</strong> {session.description}
            </p>
            <p className="card-text">
              <strong>التاريخ:</strong> {session.date}
            </p>
          </div>
          <div className="card-footer text-muted d-flex justify-content-between">
            <button
              className="btn btn-sm btn-info"
              onClick={() => handleShowDetails(session)}
            >
              <i className="fas fa-eye me-1"></i> التفاصيل
            </button>
            <button
              className="btn btn-sm btn-warning"
              onClick={() => handleEditSession(session)}
            >
              <i className="fas fa-pencil-alt me-1"></i> تعديل
            </button>
            <button
              className="btn btn-sm btn-danger"
              onClick={() => handleDeleteSession(session)}
            >
              <i className="fas fa-trash me-1"></i> حذف
            </button>
          </div>
        </div>
      </div>
    );
  }

  function SessionDetailsModal({ selectedSession, isOpen, onClose }) {
    return (
      <div
        className={`modal fade ${isOpen ? "show" : ""}`}
        id="sessionDetailsModal"
        tabIndex="-1"
        aria-labelledby="sessionDetailsModalLabel"
        style={{ display: isOpen ? "block" : "none" }}
        aria-modal="true"
        role="dialog"
      >
        <div className="modal-dialog modal-lg">
          <div className="modal-content">
            <div className="modal-header bg-dark text-white d-flex justify-content-between align-items-center">
              <h5
                className="modal-title m-0 text-end w-100"
                id="sessionDetailsModalLabel"
              >
                تفاصيل الجلسة
              </h5>
            </div>
            <div className="modal-body" dir="rtl">
              {selectedSession && (
                <div className="container">
                  <h4 className="mb-3 text-center">تفاصيل الجلسة</h4>
                  <table className="table table-bordered">
                    <tbody>
                      <tr>
                        <th>عنوان الجلسة</th>
                        <td>{selectedSession.title}</td>
                      </tr>
                      <tr>
                        <th>تاريخ الجلسة</th>
                        <td>{selectedSession.date}</td>
                      </tr>
                      <tr>
                        <th>وصف الجلسة</th>
                        <td
                          style={{
                            wordWrap: "break-word",
                            whiteSpace: "normal",
                          }}
                        >
                          {selectedSession.description}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                  <h4 className="mb-3 text-center">تفاصيل القضية</h4>
                  <table className="table table-bordered">
                    <tbody>
                      <tr>
                        <th>رقم القضية</th>
                        <td>{selectedSession.case?.case_number}</td>
                      </tr>
                      <tr>
                        <th>عنوان القضية</th>
                        <td>{selectedSession.case?.case_title}</td>
                      </tr>
                      <tr>
                        <th>سعر العقد</th>
                        <td>{selectedSession.case?.contract_price}</td>
                      </tr>
                      <tr>
                        <th>اسم المحكمة</th>
                        <td>{selectedSession.case?.court_name}</td>
                      </tr>
                      <tr>
                        <th>اسم القاضي</th>
                        <td>{selectedSession.case?.judge_name}</td>
                      </tr>
                      <tr>
                        <th>ملاحظات</th>
                        <td
                          style={{
                            wordWrap: "break-word",
                            whiteSpace: "normal",
                          }}
                        >
                          {selectedSession.case?.notes}
                        </td>
                      </tr>
                      <tr>
                        <th>اسم الخصم</th>
                        <td>{selectedSession.case?.opponent_name}</td>
                      </tr>
                      <tr>
                        <th>هاتف الخصم</th>
                        <td>{selectedSession.case?.opponent_phone}</td>
                      </tr>
                      <tr>
                        <th>جنسية الخصم</th>
                        <td>{selectedSession.case?.opponent_nation}</td>
                      </tr>
                      <tr>
                        <th>عنوان الخصم</th>
                        <td>{selectedSession.case?.opponent_address}</td>
                      </tr>
                      <tr>
                        <th>اسم محامي الخصم</th>
                        <td>{selectedSession.case?.opponent_lawyer}</td>
                      </tr>
                      <tr>
                        <th>هاتف محامي الخصم</th>
                        <td>{selectedSession.case?.lawyer_phone}</td>
                      </tr>
                    </tbody>
                  </table>
                  <h4 className="mb-3 text-center">تفاصيل العميل</h4>
                  <table className="table table-bordered">
                    <tbody>
                      <tr>
                        <th>اسم العميل</th>
                        <td>{selectedSession.case?.customer?.name}</td>
                      </tr>
                      <tr>
                        <th>رقم العميل</th>
                        <td>{selectedSession.case?.customer?.ID_number}</td>
                      </tr>
                      <tr>
                        <th>بريد العميل</th>
                        <td>{selectedSession.case?.customer?.email}</td>
                      </tr>
                      <tr>
                        <th>هاتف العميل</th>
                        <td>{selectedSession.case?.customer?.phone}</td>
                      </tr>
                      <tr>
                        <th>عنوان العميل</th>
                        <td>{selectedSession.case?.customer?.address}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              )}
            </div>
            <div className="modal-footer">
              <button
                type="button"
                className="btn btn-secondary"
                data-bs-dismiss="modal"
                onClick={onClose}
              >
                إغلاق
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  function SessionEditModal({
    isOpen,
    onClose,
    editSessionData,
    editSessionForm,
    handleEditSessionInputChange,
    handleUpdateSession,
  }) {
    return (
      <div
        className={`modal fade ${isOpen ? "show" : ""}`}
        id="editSessionModal"
        tabIndex="-1"
        aria-labelledby="editSessionModalLabel"
        aria-hidden="true"
        style={{ display: isOpen ? "block" : "none" }}
        aria-modal="true"
        role="dialog"
      >
        <div className="modal-dialog modal-lg">
          <div className="modal-content">
            <div className="modal-header bg-dark text-white d-flex justify-content-between align-items-center">
              <h5 className="modal-title m-0" id="editSessionModalLabel">
                تعديل الجلسة
              </h5>
              <button
                type="button"
                className="btn-close"
                onClick={onClose}
                aria-label="Close"
              ></button>
            </div>
            <div className="modal-body" dir="rtl">
              {editSessionData && (
                <div className="container">
                  <h4 className="mb-3 text-center">تعديل تفاصيل الجلسة</h4>
                  <table className="table table-bordered">
                    <tbody>
                      <tr>
                        <th>عنوان الجلسة</th>
                        <td>
                          <input
                            type="text"
                            className="form-control"
                            name="title"
                            value={editSessionForm.title}
                            onChange={handleEditSessionInputChange}
                          />
                        </td>
                      </tr>
                      <tr>
                        <th>تاريخ الجلسة</th>
                        <td>
                          <input
                            type="date"
                            className="form-control"
                            name="date"
                            value={editSessionForm.date}
                            onChange={handleEditSessionInputChange}
                          />
                        </td>
                      </tr>
                      <tr>
                        <th>وصف الجلسة</th>
                        <td>
                          <textarea
                            className="form-control"
                            name="description"
                            value={editSessionForm.description}
                            onChange={handleEditSessionInputChange}
                          />
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              )}
            </div>
            <div className="modal-footer">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={onClose}
                data-bs-dismiss="modal"
              >
                إغلاق
              </button>
              <button
                type="button"
                className="btn btn-primary"
                onClick={handleUpdateSession}
              >
                حفظ التغييرات
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="sessions" style={{ backgroundColor: "white" }}>
      <div
        className=" container  py-5 mb-4 d-flex align-items-center justify-content-between"
        style={{ direction: "rtl" }}
      >
        <div className="col-xl-6 col-12">
          <div className="d-flex align-items-center">
            <i className="fas fa-calendar-alt me-2 ms-3"></i>
            <h2 className="mb-0" style={{ fontWeight: "bold" }}>
              إدارة الجلسات
            </h2>
          </div>
        </div>
        <div className="col-xl-6 col-12">
          <div className="me-auto" style={{ maxWidth: "300px" }}>
            <input
              type="text"
              className="form-control"
              placeholder="ابحث عن جلسة..."
              value={searchTerm}
              onChange={handleSearch}
            />
          </div>
        </div>
      </div>
      <div className="container">
        <div className="row row-cols-1 row-cols-md-3 g-4 flex-row-reverse">
          {filteredSessions.map((session) => (
            <SessionCard
              key={session.session_id}
              session={session}
              handleShowDetails={handleShowDetails}
              handleDeleteSession={handleDeleteSession}
              handleEditSession={handleEditSession}
            />
          ))}
        </div>
      </div>
      <SessionDetailsModal
        selectedSession={selectedSession}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
      />
      <SessionEditModal
        isOpen={isEditModalOpen}
        onClose={handleCloseEditModal}
        editSessionData={editSessionData}
        editSessionForm={editSessionForm}
        handleEditSessionInputChange={handleEditSessionInputChange}
        handleUpdateSession={handleUpdateSession}
      />
    </div>
  );
}

export default Sessions;
