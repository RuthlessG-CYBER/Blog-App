const fs = require('fs');
let code = fs.readFileSync('frontend/app/comments.tsx', 'utf8');

// 1. Swap useEffect and fetchComments
const before = `  useEffect(() => {
    fetchComments();
  }, [postId]);

  const fetchComments = async () => {
    try {
      setLoading(true);
      const res = await getComments(postId as string);
      setComments(res.data.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };`;

const after = `  const fetchComments = async () => {
    try {
      setLoading(true);
      const res = await getComments(postId as string);
      setComments(res.data.data);
    } catch (error: any) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComments();
  }, [postId]);`;

code = code.replace(before, after);

// 2. Fix the second catch(error) in handleSubmit
code = code.replace("catch (error) {", "catch (error: any) {");

fs.writeFileSync('frontend/app/comments.tsx', code);
