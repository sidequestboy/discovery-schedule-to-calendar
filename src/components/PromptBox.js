import { BallTriangle } from "react-loader-spinner";

export function PromptBox({ isLoading, children }) {
  return (
    <>
      <div className={`box ${isLoading ? "loading" : ""}`}>
        <div className={isLoading ? "blur" : ""}>{children}</div>
        <BallTriangle
          height={100}
          width={100}
          radius={5}
          ariaLabel="ball-triangle-loading"
          wrapperClass="loader-spinner"
          visible={isLoading}
        />
      </div>
    </>
  );
}
