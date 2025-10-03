import React, { useState } from "react";
import {
  Card,
  CardBody,
  CardTitle,
  CardText,
  Button,
  Spinner,
  Alert,
  Form,
  FormGroup,
  Label,
  Input,
} from "reactstrap";
import {
  useDashboardData,
  useUser,
  useUpdateProfile,
} from "../../hooks/useApi";
import {
  useInfinitePosts,
  useCreatePost,
  useUploadAvatar,
} from "../../hooks/useApiAdvanced";

const ApiExample: React.FC = () => {
  const [userId, setUserId] = useState("1");
  const [newPost, setNewPost] = useState({
    title: "",
    content: "",
    authorId: "1",
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  // Basic queries
  const {
    data: dashboardData,
    isLoading: dashboardLoading,
    error: dashboardError,
  } = useDashboardData();
  const {
    data: user,
    isLoading: userLoading,
    error: userError,
  } = useUser(userId);

  // Advanced queries
  const {
    data: infinitePosts,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfinitePosts(5);
  const createPostMutation = useCreatePost();
  const uploadAvatarMutation = useUploadAvatar();
  const updateProfileMutation = useUpdateProfile();

  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPost.title && newPost.content) {
      await createPostMutation.mutateAsync(newPost);
      setNewPost({ title: "", content: "", authorId: "1" });
    }
  };

  const handleFileUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedFile && userId) {
      await uploadAvatarMutation.mutateAsync({ userId, file: selectedFile });
      setSelectedFile(null);
    }
  };

  return (
    <div className="row">
      {/* Basic API Usage */}
      <div className="col-md-6 mb-4">
        <Card>
          <CardBody>
            <CardTitle tag="h5">Basic API Usage</CardTitle>

            {/* Dashboard Data */}
            <div className="mb-3">
              <h6>Dashboard Data</h6>
              {dashboardLoading && <Spinner size="sm" />}
              {dashboardError && (
                <Alert color="danger">
                  Error: {(dashboardError as any)?.message}
                </Alert>
              )}
              {dashboardData && (
                <pre
                  className="bg-light p-2 rounded"
                  style={{ fontSize: "12px" }}
                >
                  {JSON.stringify(dashboardData, null, 2)}
                </pre>
              )}
            </div>

            {/* User Data */}
            <div className="mb-3">
              <h6>User Data</h6>
              <FormGroup>
                <Label for="userId">User ID:</Label>
                <Input
                  type="text"
                  id="userId"
                  value={userId}
                  onChange={(e) => setUserId(e.target.value)}
                  placeholder="Enter user ID"
                />
              </FormGroup>
              {userLoading && <Spinner size="sm" />}
              {userError && (
                <Alert color="danger">
                  Error: {(userError as any)?.message}
                </Alert>
              )}
              {user && (
                <pre
                  className="bg-light p-2 rounded"
                  style={{ fontSize: "12px" }}
                >
                  {JSON.stringify(user, null, 2)}
                </pre>
              )}
            </div>
          </CardBody>
        </Card>
      </div>

      {/* Advanced API Usage */}
      <div className="col-md-6 mb-4">
        <Card>
          <CardBody>
            <CardTitle tag="h5">Advanced API Usage</CardTitle>

            {/* Create Post Form */}
            <div className="mb-3">
              <h6>Create Post (Optimistic Updates)</h6>
              <Form onSubmit={handleCreatePost}>
                <FormGroup>
                  <Label for="postTitle">Title:</Label>
                  <Input
                    type="text"
                    id="postTitle"
                    value={newPost.title}
                    onChange={(e) =>
                      setNewPost({ ...newPost, title: e.target.value })
                    }
                    placeholder="Enter post title"
                  />
                </FormGroup>
                <FormGroup>
                  <Label for="postContent">Content:</Label>
                  <Input
                    type="textarea"
                    id="postContent"
                    value={newPost.content}
                    onChange={(e) =>
                      setNewPost({ ...newPost, content: e.target.value })
                    }
                    placeholder="Enter post content"
                  />
                </FormGroup>
                <Button
                  type="submit"
                  color="primary"
                  disabled={createPostMutation.isPending}
                  size="sm"
                >
                  {createPostMutation.isPending ? (
                    <Spinner size="sm" />
                  ) : (
                    "Create Post"
                  )}
                </Button>
              </Form>
            </div>

            {/* File Upload */}
            <div className="mb-3">
              <h6>Upload Avatar</h6>
              <Form onSubmit={handleFileUpload}>
                <FormGroup>
                  <Label for="avatarFile">Avatar File:</Label>
                  <Input
                    type="file"
                    id="avatarFile"
                    onChange={(e) =>
                      setSelectedFile(e.target.files?.[0] || null)
                    }
                    accept="image/*"
                  />
                </FormGroup>
                <Button
                  type="submit"
                  color="success"
                  disabled={uploadAvatarMutation.isPending || !selectedFile}
                  size="sm"
                >
                  {uploadAvatarMutation.isPending ? (
                    <Spinner size="sm" />
                  ) : (
                    "Upload Avatar"
                  )}
                </Button>
              </Form>
            </div>
          </CardBody>
        </Card>
      </div>

      {/* Infinite Posts */}
      <div className="col-12 mb-4">
        <Card>
          <CardBody>
            <CardTitle tag="h5">Infinite Posts (Pagination)</CardTitle>
            <CardText>
              This demonstrates infinite scrolling with React Query and the
              axios instance.
            </CardText>

            {infinitePosts?.pages.map((page, pageIndex) => (
              <div key={pageIndex}>
                {page.data.map((post: any) => (
                  <div key={post.id} className="border-bottom p-2 mb-2">
                    <h6>{post.title}</h6>
                    <p className="text-muted mb-1">{post.content}</p>
                    <small className="text-muted">
                      Created: {new Date(post.createdAt).toLocaleDateString()}
                    </small>
                  </div>
                ))}
              </div>
            ))}

            <div className="text-center mt-3">
              <Button
                onClick={() => fetchNextPage()}
                disabled={!hasNextPage || isFetchingNextPage}
                color="primary"
                size="sm"
              >
                {isFetchingNextPage ? (
                  <>
                    <Spinner size="sm" className="me-2" />
                    Loading more...
                  </>
                ) : hasNextPage ? (
                  "Load More"
                ) : (
                  "No more posts"
                )}
              </Button>
            </div>
          </CardBody>
        </Card>
      </div>

      {/* API Status */}
      <div className="col-12">
        <Card>
          <CardBody>
            <CardTitle tag="h5">API Status</CardTitle>
            <div className="row">
              <div className="col-md-3">
                <div className="text-center">
                  <h6>Dashboard</h6>
                  {dashboardLoading ? (
                    <span className="badge bg-warning">Loading</span>
                  ) : dashboardError ? (
                    <span className="badge bg-danger">Error</span>
                  ) : (
                    <span className="badge bg-success">Success</span>
                  )}
                </div>
              </div>
              <div className="col-md-3">
                <div className="text-center">
                  <h6>User</h6>
                  {userLoading ? (
                    <span className="badge bg-warning">Loading</span>
                  ) : userError ? (
                    <span className="badge bg-danger">Error</span>
                  ) : (
                    <span className="badge bg-success">Success</span>
                  )}
                </div>
              </div>
              <div className="col-md-3">
                <div className="text-center">
                  <h6>Create Post</h6>
                  {createPostMutation.isPending ? (
                    <span className="badge bg-warning">Loading</span>
                  ) : createPostMutation.isError ? (
                    <span className="badge bg-danger">Error</span>
                  ) : createPostMutation.isSuccess ? (
                    <span className="badge bg-success">Success</span>
                  ) : (
                    <span className="badge bg-secondary">Idle</span>
                  )}
                </div>
              </div>
              <div className="col-md-3">
                <div className="text-center">
                  <h6>Upload Avatar</h6>
                  {uploadAvatarMutation.isPending ? (
                    <span className="badge bg-warning">Loading</span>
                  ) : uploadAvatarMutation.isError ? (
                    <span className="badge bg-danger">Error</span>
                  ) : uploadAvatarMutation.isSuccess ? (
                    <span className="badge bg-success">Success</span>
                  ) : (
                    <span className="badge bg-secondary">Idle</span>
                  )}
                </div>
              </div>
            </div>
          </CardBody>
        </Card>
      </div>
    </div>
  );
};

export default ApiExample;
