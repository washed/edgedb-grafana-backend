CREATE MIGRATION m1ghjggio4ulsw5d5gc7crj7us4povkfm5sfo4rbbnamjnjf24mi4a
    ONTO initial
{
  CREATE FUTURE nonrecursive_access_policies;
  CREATE TYPE default::SomeTimeSeries {
      CREATE REQUIRED PROPERTY timestamp -> std::datetime;
      CREATE REQUIRED PROPERTY value -> std::float32;
  };
};
