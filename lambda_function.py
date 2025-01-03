import json
import boto3
from typing import Dict, List, Optional
from datetime import datetime

s3_client = boto3.client('s3')
BUCKET_NAME = 'nationslablmscoursebucket'

def list_folders(path: str = '') -> Dict:
    """
    S3 버킷의 특정 경로의 폴더들을 조회합니다.
    """
    try:
        response = s3_client.list_objects_v2(
            Bucket=BUCKET_NAME,
            Prefix=path,
            Delimiter='/'
        )
        
        folders = []
        # CommonPrefixes는 폴더를 나타냄
        for prefix in response.get('CommonPrefixes', []):
            folder_path = prefix.get('Prefix', '')
            folder_name = folder_path.rstrip('/').split('/')[-1]
            
            folders.append({
                'type': 'directory',
                'name': folder_name,
                'path': folder_path
            })
            
        # Contents는 파일을 나타냄
        for content in response.get('Contents', []):
            key = content.get('Key', '')
            if not key.endswith('/'):  # 폴더가 아닌 파일만 처리
                file_name = key.split('/')[-1]
                folders.append({
                    'type': 'file',
                    'name': file_name,
                    'path': key,
                    'lastModified': content.get('LastModified').isoformat()
                })
        
        return {
            'statusCode': 200,
            'body': json.dumps({
                'folders': folders
            })
        }
    except Exception as e:
        print(f"Error in list_folders: {str(e)}")
        return {
            'statusCode': 500,
            'body': json.dumps({
                'error': str(e)
            })
        }

def get_file_content(file_path: str) -> Dict:
    """
    S3 버킷의 특정 파일 내용을 조회합니다.
    """
    try:
        response = s3_client.get_object(
            Bucket=BUCKET_NAME,
            Key=file_path
        )
        
        content = response['Body'].read().decode('utf-8')
        
        return {
            'statusCode': 200,
            'body': content
        }
    except Exception as e:
        print(f"Error in get_file_content: {str(e)}")
        return {
            'statusCode': 500,
            'body': json.dumps({
                'error': str(e)
            })
        }

def create_course(event: Dict) -> Dict:
    """
    새로운 코스를 생성합니다.
    """
    try:
        body = json.loads(event.get('body', '{}'))
        main_category = body.get('category')
        sub_category = body.get('subcategory')
        course_name = body.get('name')
        
        if not all([main_category, sub_category, course_name]):
            return {
                'statusCode': 400,
                'body': json.dumps({
                    'error': 'Category, subcategory, and course name are required'
                })
            }
        
        course_path = f"{main_category}/{sub_category}/courses/{course_name}"
        
        # 코스 메타데이터
        meta = {
            'title': body.get('title', course_name),
            'description': body.get('description', ''),
            'instructor_id': body.get('instructor_id', ''),
            'lastModified': datetime.now().isoformat(),
            'createdAt': datetime.now().isoformat()
        }
        
        # 메타데이터 파일 저장
        s3_client.put_object(
            Bucket=BUCKET_NAME,
            Key=f"{course_path}/meta.json",
            Body=json.dumps(meta)
        )
        
        # 주차 폴더 생성
        for week in range(1, 17):
            s3_client.put_object(
                Bucket=BUCKET_NAME,
                Key=f"{course_path}/{week}주차/",
                Body=''
            )
            # 주차별 메타데이터
            s3_client.put_object(
                Bucket=BUCKET_NAME,
                Key=f"{course_path}/{week}주차/meta.json",
                Body=json.dumps({
                    'title': f'{week}주차',
                    'description': '',
                    'status': 'SCHEDULED'
                })
            )
        
        return {
            'statusCode': 200,
            'body': json.dumps({
                'message': 'Course created successfully',
                'course': {
                    'name': course_name,
                    'path': course_path,
                    **meta
                }
            })
        }
    except Exception as e:
        print(f"Error in create_course: {str(e)}")
        return {
            'statusCode': 500,
            'body': json.dumps({
                'error': str(e)
            })
        }

def lambda_handler(event: Dict, context: Dict) -> Dict:
    """
    Lambda 함수의 메인 핸들러
    """
    http_method = event.get('requestContext', {}).get('http', {}).get('method')
    path = event.get('rawPath', '').rstrip('/')
    query_params = event.get('queryStringParameters', {})
    
    print(f"Received request - Method: {http_method}, Path: {path}")
    print(f"Event: {json.dumps(event)}")
    
    if http_method == 'GET':
        if path == '/folders':
            folder_path = query_params.get('path', '')
            return list_folders(folder_path)
        elif path == '/files':
            file_path = query_params.get('path', '')
            return get_file_content(file_path)
    elif http_method == 'POST':
        if path == '/courses':
            return create_course(event)
    
    return {
        'statusCode': 404,
        'body': json.dumps({
            'error': 'Not Found',
            'method': http_method,
            'path': path
        })
    } 