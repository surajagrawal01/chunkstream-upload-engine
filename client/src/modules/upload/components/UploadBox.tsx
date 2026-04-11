import { handleFileUpload, handleFileSelection } from "../hooks/useUpload";

const UploadBox = () => {

    return (
        <>
            <h1>Upload</h1>

            <input type="file" onChange={handleFileSelection} />
            <br />
            <input
                type="file"
                multiple
                ref={(input) => {
                    if (input) {
                        input.setAttribute("webkitdirectory", "");
                    }
                }}
                onChange={handleFileSelection}
            />
            <button onClick={handleFileUpload}>Upload</button>
        </>
    )
}

export default UploadBox;