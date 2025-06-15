function UserProfileSkeleton() {
  return (
    <div className="flex w-full animate-pulse flex-row items-center">
      <div className="mr-3 h-[54px] w-[54px] rounded-full bg-gray-500/50"></div>
      <div className="flex flex-col space-y-2">
        <div className="h-5 w-24 rounded bg-gray-500/50"></div>
        <div className="h-4 w-32 rounded bg-gray-500/50"></div>
      </div>
    </div>
  );
}

export default UserProfileSkeleton;