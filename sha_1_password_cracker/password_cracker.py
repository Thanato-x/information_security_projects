from hashlib import sha1

def crack_sha1_hash(hash, use_salts = False):
    top_10k_passwords=[]
    hashed_top_10k_passwords = {}

    with open('top-10000-passwords.txt','r') as file:
        lines = file.readlines()
        for line in lines:
            top_10k_passwords.append(line.strip())

    for passwords in top_10k_passwords:
        
        if not use_salts:
            hashed_top_10k_password = sha1(passwords.encode()).hexdigest()
            hashed_top_10k_passwords[hashed_top_10k_password] = passwords

            continue

        with open('known-salts.txt','r') as file:
            lines = file.readlines()
            for line in lines:
                
                encoded_passwords_with_salt = [line.strip().encode() + passwords.encode(), passwords.encode() + line.strip().encode()]

                for encoded_password_with_salt in encoded_passwords_with_salt:
                    hashed_top_10k_password = sha1(encoded_password_with_salt).hexdigest()
                    hashed_top_10k_passwords[hashed_top_10k_password] = passwords

    if hash in hashed_top_10k_passwords:
        return hashed_top_10k_passwords[hash]

    return 'PASSWORD NOT IN DATABASE'
