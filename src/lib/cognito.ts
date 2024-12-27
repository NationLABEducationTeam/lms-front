import { CognitoIdentityProviderClient, 
  ListUsersCommand, 
  ListUsersInGroupCommand,
  AdminGetUserCommand,
  AdminListGroupsForUserCommand,
  GetUserCommand,
  type UserType,
  type AttributeType
} from "@aws-sdk/client-cognito-identity-provider";
import { getCurrentUser, fetchAuthSession } from 'aws-amplify/auth';

const getCognitoClient = async () => {
  try {
    const session = await fetchAuthSession();
    console.log('Full session details:', {
      hasCredentials: !!session.credentials,
      hasIdentityId: !!session.identityId,
      tokens: {
        accessToken: !!session.tokens?.accessToken,
        idToken: !!session.tokens?.idToken,
        payload: session.tokens?.idToken?.payload
      },
      userSub: session.userSub
    });

    if (!session.tokens?.accessToken) {
      throw new Error('액세스 토큰이 없습니다.');
    }

    return new CognitoIdentityProviderClient({
      region: import.meta.env.AWS_REGION,
      credentials: {
        accessKeyId: import.meta.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: import.meta.env.AWS_SECRET_ACCESS_KEY
      }
    });
  } catch (error) {
    console.error('Error creating Cognito client:', {
      error,
      errorName: error instanceof Error ? error.name : 'Unknown error',
      errorMessage: error instanceof Error ? error.message : 'Unknown error message',
      errorStack: error instanceof Error ? error.stack : 'No stack trace'
    });
    throw error;
  }
};

export interface CognitoUser {
  id: string;
  username: string;
  email: string;
  name: string;
  role: string;
  joinDate: string;
  lastModified?: string;
}

const mapUserAttributes = (attributes: AttributeType[]): Partial<CognitoUser> => {
  const result: Partial<CognitoUser> = {};
  
  attributes.forEach(attr => {
    switch (attr.Name) {
      case 'email':
        result.email = attr.Value;
        break;
      case 'given_name':
        result.name = attr.Value;
        break;
      case 'custom:role':
        result.role = attr.Value;
        break;
    }
  });
  
  return result;
};

const mapCognitoUser = (user: UserType): CognitoUser => {
  const attrs = mapUserAttributes(user.Attributes || []);
  return {
    id: user.Username || '',
    username: user.Username || '',
    email: attrs.email || '',
    name: attrs.name || '',
    role: attrs.role || '',
    joinDate: user.UserCreateDate?.toISOString().split('T')[0] || '',
    lastModified: user.UserLastModifiedDate?.toISOString().split('T')[0]
  };
};

// 관리자용: 모든 사용자 목록 조회
export const listAllUsers = async (): Promise<CognitoUser[]> => {
  try {
    const client = await getCognitoClient();
    const currentUser = await getCurrentUser();
    console.log('Current user:', currentUser);

    const userGroups = await client.send(new AdminListGroupsForUserCommand({
      UserPoolId: import.meta.env.COGNITO_USER_POOL_ID,
      Username: currentUser.username
    }));
    console.log('User groups:', userGroups.Groups);

    // ADMIN 그룹에 속한 사용자만 모든 사용자 목록을 볼 수 있음
    if (!userGroups.Groups?.some(group => group.GroupName === 'ADMIN')) {
      console.error('User is not in ADMIN group:', userGroups.Groups);
      throw new Error('관리자 권한이 없습니다.');
    }

    const command = new ListUsersCommand({
      UserPoolId: import.meta.env.COGNITO_USER_POOL_ID
    });
    
    const response = await client.send(command);
    console.log('Users list response:', response);
    return (response.Users || []).map(mapCognitoUser);
  } catch (error) {
    console.error('Error listing users:', {
      error,
      errorName: error instanceof Error ? error.name : 'Unknown error',
      errorMessage: error instanceof Error ? error.message : 'Unknown error message',
      errorStack: error instanceof Error ? error.stack : 'No stack trace'
    });
    throw error;
  }
};

// 강사용: 자신의 학생 목록 조회
export const listStudentsInGroup = async (groupName: string): Promise<CognitoUser[]> => {
  try {
    const client = await getCognitoClient();
    const currentUser = await getCurrentUser();
    console.log('Current user:', currentUser);

    const userGroups = await client.send(new AdminListGroupsForUserCommand({
      UserPoolId: import.meta.env.COGNITO_USER_POOL_ID,
      Username: currentUser.username
    }));
    console.log('User groups:', userGroups.Groups);

    // INSTRUCTOR 그룹에 속한 사용자만 학생 목록을 볼 수 있음
    if (!userGroups.Groups?.some(group => group.GroupName === 'INSTRUCTOR')) {
      console.error('User is not in INSTRUCTOR group:', userGroups.Groups);
      throw new Error('강사 권한이 없습니다.');
    }

    // 학생 그룹만 조회 가능하도록 제한
    if (groupName !== 'STUDENT') {
      console.error('Attempted to list non-STUDENT group:', groupName);
      throw new Error('학생 목록만 조회할 수 있습니다.');
    }

    const command = new ListUsersInGroupCommand({
      UserPoolId: import.meta.env.COGNITO_USER_POOL_ID,
      GroupName: groupName
    });
    
    const response = await client.send(command);
    console.log('Students list response:', response);
    return (response.Users || []).map(mapCognitoUser);
  } catch (error) {
    console.error('Error listing users in group:', {
      error,
      groupName,
      errorName: error instanceof Error ? error.name : 'Unknown error',
      errorMessage: error instanceof Error ? error.message : 'Unknown error message',
      errorStack: error instanceof Error ? error.stack : 'No stack trace'
    });
    throw error;
  }
};

// 현재 사용자 정보 조회
export const getCurrentUserDetails = async (username: string): Promise<CognitoUser> => {
  try {
    const client = await getCognitoClient();
    const currentUser = await getCurrentUser();
    console.log('Current user:', currentUser);

    // 자신의 정보만 조회 가능
    if (currentUser.username !== username) {
      console.error('Attempted to access different user details:', {
        currentUsername: currentUser.username,
        requestedUsername: username
      });
      throw new Error('자신의 정보만 조회할 수 있습니다.');
    }

    const command = new AdminGetUserCommand({
      UserPoolId: import.meta.env.COGNITO_USER_POOL_ID,
      Username: username
    });
    
    const response = await client.send(command);
    console.log('User details response:', response);
    return {
      id: response.Username || '',
      username: response.Username || '',
      ...mapUserAttributes(response.UserAttributes || []),
      joinDate: response.UserCreateDate?.toISOString().split('T')[0] || '',
      lastModified: response.UserLastModifiedDate?.toISOString().split('T')[0]
    } as CognitoUser;
  } catch (error) {
    console.error('Error getting user details:', {
      error,
      username,
      errorName: error instanceof Error ? error.name : 'Unknown error',
      errorMessage: error instanceof Error ? error.message : 'Unknown error message',
      errorStack: error instanceof Error ? error.stack : 'No stack trace'
    });
    throw error;
  }
}; 