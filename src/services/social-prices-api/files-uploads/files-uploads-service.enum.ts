namespace FilesUploadsServiceEnum {
  export enum Methods {
    FIND_BY_ID = "/filesUploads/:fileUploadId",
    FIND_BY_USER_TABLE_STATE = "/filesUploads/userTableState",
    DOWNLOAD_ERRORS = "/filesUploads/downloadErrors/:fileUploadId",
  }
}

export default FilesUploadsServiceEnum;
