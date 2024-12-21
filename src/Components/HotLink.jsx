import { Link } from "react-router-dom";

function HotLink(props) {
  return (
    <>
      <Link to={props.link} style={{ textDecoration: "none" }}>
        <div
          className="card hover mb-3"
          style={{
            maxWidth: "18rem",
            backgroundColor: "#fff",
            boxShadow: "0 4px 8px rgba(0, 0, 0, 0.2)",
            transition: "transform 0.3s, box-shadow 0.3s",
          }}
          onMouseOver={(e) => (e.currentTarget.style.transform = "scale(1.05)")}
          onMouseOut={(e) => (e.currentTarget.style.transform = "scale(1)")}
        >
          <div
            className="card-header text-white"
            style={{ backgroundColor: "#1a237e", textAlign: "right" }} // إضافة textAlign: "right" هنا
          >
            {props.title}
          </div>
          <div
            className="card-body d-flex align-items-center justify-content-end"
            style={{ backgroundColor: "#fff" }}
          >
            <p className="card-text">
              <i className={props.icon} style={{ color: "#1a237e" }}></i>
            </p>
          </div>
        </div>
      </Link>
    </>
  );
}

export default HotLink;
