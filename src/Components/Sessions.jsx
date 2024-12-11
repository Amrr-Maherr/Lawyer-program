import React, { useEffect, useState } from "react";
import axios from "axios";
import Swal from "sweetalert2"; // استيراد SweetAlert2

const Sessions = () => {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [currentSession, setCurrentSession] = useState({});

  // جلب الجلسات فقط
  useEffect(() => {
    const fetchSessions = async () => {
      const token = localStorage.getItem("token");

      if (!token) {
        Swal.fire({
          icon: "warning",
          title: "تنبيه",
          text: "يرجى تسجيل الدخول",
        });
        return;
      }

      try {
        const response = await axios.get(
          `https://law-office.al-mosa.com/api/sessions`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (Array.isArray(response.data.sessions)) {
          setSessions(response.data.sessions);
        } else {
          Swal.fire({
            icon: "error",
            title: "خطأ",
            text: "لا توجد جلسات",
          });
        }
        setLoading(false);
      } catch (error) {
        console.error("خطأ في جلب الجلسات:", error);
        setLoading(false);
      }
    };

    fetchSessions();
  }, []);

  // فتح المودال وتعيين الجلسة الحالية للتعديل
  const handleEditDetails = (session) => {
    setCurrentSession(session); // تعيين الجلسة الحالية للتعديل
    setShowModal(true); // فتح المودال
  };

  // تعديل الجلسة
  const handleSaveChanges = async () => {
    const token = localStorage.getItem("token");

    if (!token) {
      Swal.fire({
        icon: "warning",
        title: "تنبيه",
        text: "يرجى تسجيل الدخول",
      });
      return;
    }

    try {
      const response = await axios.put(
        `https://law-office.al-mosa.com/api/sessions/${currentSession.session_id}`,
        {
          title: currentSession.title,
          date: currentSession.date,
          description: currentSession.description,
          case_number: currentSession.case_number,
          customer_name: currentSession.customer_name,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.success) {
        Swal.fire({
          icon: "success",
          title: "نجاح",
          text: "تم تعديل الجلسة بنجاح!",
        });
        setShowModal(false);
        // تحديث البيانات بعد التعديل
        setSessions(
          sessions.map((session) =>
            session.session_id === currentSession.session_id
              ? currentSession
              : session
          )
        );
      } else {
        Swal.fire({
          icon: "error",
          title: "خطأ",
          text: "حدث خطأ أثناء تعديل الجلسة.",
        });
      }
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "خطأ",
        text: "حدث خطأ أثناء تعديل الجلسة.",
      });
      console.error(error);
    }
  };

  return (
    <div className="container my-5 text-right" dir="rtl">
      <h2 className="text-center mb-4">تفاصيل الجلسات</h2>

      {loading ? (
        <div className="text-center">
          <i className="fa fa-spinner fa-spin"></i> تحميل البيانات...
        </div>
      ) : sessions.length > 0 ? (
        <div className="row">
          {sessions.map((session) => (
            <div className="col-md-4 mb-4" key={session.session_id}>
              <div
                className="card shadow-lg border-light rounded-3"
                style={{ cursor: "pointer", transition: "transform 0.3s" }}
              >
                <div className="card-header bg-primary text-white rounded-top">
                  <i
                    className="fa fa-gavel me-2"
                    style={{ fontSize: "20px" }}
                  ></i>
                  {session.title}
                </div>
                <div className="card-body">
                  <p>
                    <strong>التاريخ:</strong>{" "}
                    {new Date(session.date).toLocaleDateString("ar-EG")}
                  </p>
                  <p>
                    <strong>الوصف:</strong> {session.description}
                  </p>
                  <p>
                    <strong>رقم القضية:</strong> {session.case_number}
                  </p>
                  <p>
                    <strong>اسم العميل:</strong> {session.customer_name}
                  </p>

                  <div className="d-flex justify-content-between align-items-center">
                    <button
                      className="btn btn-warning px-4"
                      onClick={() => handleEditDetails(session)}
                    >
                      تعديل
                    </button>
                    <span className="badge bg-success">
                      {session.status === "مكتمل" ? "مكتمل" : "قيد الانتظار"}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center text-danger">لا توجد جلسات.</div>
      )}

      {/* مودال التعديل */}
      {showModal && (
        <div
          className="modal fade show"
          style={{ display: "block" }}
          tabIndex="-1"
          aria-labelledby="editSessionModalLabel"
          aria-hidden="true"
        >
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title" id="editSessionModalLabel">
                  تعديل تفاصيل الجلسة
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  data-bs-dismiss="modal"
                  aria-label="Close"
                  onClick={() => setShowModal(false)}
                ></button>
              </div>
              <div className="modal-body">
                <form>
                  <div className="mb-3">
                    <label htmlFor="sessionTitle" className="form-label">
                      العنوان
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      id="sessionTitle"
                      value={currentSession.title || ""}
                      onChange={(e) =>
                        setCurrentSession({
                          ...currentSession,
                          title: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div className="mb-3">
                    <label htmlFor="sessionDate" className="form-label">
                      التاريخ
                    </label>
                    <input
                      type="date"
                      className="form-control"
                      id="sessionDate"
                      value={currentSession.date || ""}
                      onChange={(e) =>
                        setCurrentSession({
                          ...currentSession,
                          date: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div className="mb-3">
                    <label htmlFor="sessionDescription" className="form-label">
                      الوصف
                    </label>
                    <textarea
                      className="form-control"
                      id="sessionDescription"
                      rows="3"
                      value={currentSession.description || ""}
                      onChange={(e) =>
                        setCurrentSession({
                          ...currentSession,
                          description: e.target.value,
                        })
                      }
                    ></textarea>
                  </div>
                  <div className="mb-3">
                    <label htmlFor="sessionCaseNumber" className="form-label">
                      رقم القضية
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      id="sessionCaseNumber"
                      value={currentSession.case_number || ""}
                      onChange={(e) =>
                        setCurrentSession({
                          ...currentSession,
                          case_number: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div className="mb-3">
                    <label htmlFor="sessionCustomerName" className="form-label">
                      اسم العميل
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      id="sessionCustomerName"
                      value={currentSession.customer_name || ""}
                      onChange={(e) =>
                        setCurrentSession({
                          ...currentSession,
                          customer_name: e.target.value,
                        })
                      }
                    />
                  </div>
                </form>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  data-bs-dismiss="modal"
                  onClick={() => setShowModal(false)}
                >
                  إلغاء
                </button>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={handleSaveChanges}
                >
                  حفظ التعديلات
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Sessions;
