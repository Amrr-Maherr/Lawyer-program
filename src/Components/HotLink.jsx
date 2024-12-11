import { Link } from "react-router-dom";

function HotLink(props) {
  return (
    <>
      <Link to={props.link} style={{ textDecoration: "none" }}>
        <div
          className="card hover text-secondary-emphasis mb-3"
          style={{
            maxWidth: "18rem",
            boxShadow: "0 4px 8px rgba(0, 0, 0, 0.2)", // إضافة ظل عند التمرير على العنصر
            transition: "transform 0.3s, box-shadow 0.3s", // تأثير التحول
          }}
          onMouseOver={(e) => (e.currentTarget.style.transform = "scale(1.05)")} // تكبير العنصر عند التمرير عليه
          onMouseOut={(e) => (e.currentTarget.style.transform = "scale(1)")}
        >
          <div className="card-header bg-dark text-white">{props.title}</div>
          <div className="card-body d-flex align-items-center justify-content-end">
            <p className="card-text">
              <i className={props.icon}></i>
            </p>
          </div>
        </div>
      </Link>
    </>
  );
}

export default HotLink;
