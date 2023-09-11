import { BallTriangle } from "react-loader-spinner";

export function PromptBox({ error, isLoading, children }) {
  return (
    <>
      <div className={`box ${isLoading ? "loading" : ""}`}>
        {error ? (
          <>
            <p className="error">{error}</p>
            <button className="btn" onClick={() => window.location.reload()}>
              Start over
            </button>
          </>
        ) : (
          <>
            <div className={isLoading ? "blur" : ""}>{children}</div>
            <BallTriangle
              height={100}
              width={100}
              radius={5}
              ariaLabel="ball-triangle-loading"
              wrapperClass="loader-spinner"
              visible={isLoading}
            />
          </>
        )}
      </div>
    </>
  );
}
