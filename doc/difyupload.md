
files
Type
array[object]
Description
文件列表，适用于传入文件结合文本理解并回答问题，仅当模型支持 Vision/Video 能力时可用。

type (string) 支持类型：
document 具体类型包含：'TXT', 'MD', 'MARKDOWN', 'MDX', 'PDF', 'HTML', 'XLSX', 'XLS', 'VTT', 'PROPERTIES', 'DOC', 'DOCX', 'CSV', 'EML', 'MSG', 'PPTX', 'PPT', 'XML', 'EPUB'
image 具体类型包含：'JPG', 'JPEG', 'PNG', 'GIF', 'WEBP', 'SVG'
audio 具体类型包含：'MP3', 'M4A', 'WAV', 'WEBM', 'MPGA'
video 具体类型包含：'MP4', 'MOV', 'MPEG', 'WEBM'
custom 具体类型包含：其他文件类型
transfer_method (string) 传递方式:
remote_url: 文件地址。
local_file: 上传文件。
url 文件地址。（仅当传递方式为 remote_url 时）。
upload_file_id 上传文件 ID。（仅当传递方式为 local_file 时）。
