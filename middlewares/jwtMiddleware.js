import jwt from 'jsonwebtoken';
import cookie from 'cookie';
import dotenv from 'dotenv';

dotenv.config();

const jwtAuth = (roles = []) => {
  return (req, res, next) => {
    const parsedCookies = cookie.parse(req.headers.cookie || '');
    const token = parsedCookies.GDS_Token;
    const branchId = parsedCookies.branchId; // ✅ read branchId cookie
    if (!token) {
      return res.status(401).json({ message: 'Credential Not Found Login Again' });
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      if (roles.length && !roles.includes(decoded.role)) {
        return res.status(403).json({ message: 'Forbidden: Role not authorized' });
      }

      req.user = decoded;
    //   req.branchId = branchId || null; // ✅ safe fallback
      req.branchId = branchId || "68a5b8b9ebc6f065f5b5520e"; // ✅ safe fallback
      next();
    } catch (err) {
      return res.status(401).json({ message: 'Credential Invalid or Expired Please Login Again' });
    }
  };
};

export default jwtAuth;
